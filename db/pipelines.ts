import {
  DateRange,
  RetrievalOptions,
  TransactionCategoryType,
  TransactionIOEnum,
  TransactionRetrievalOptions,
} from '@/server/schemas';
import { TZ } from '@/utils/constants';
import { tz, TZDate } from '@date-fns/tz';
import { startOfMonth } from 'date-fns';

const filterIO = (type: TransactionIOEnum) => ({
  'attributes.amount.valueInBaseUnits': {
    ...(type === 'income' ? { $gt: 0 } : { $lt: 0 }),
  },
});

/**
 * Generates total income and expense statistics
 * for transactions labelled by `labelIO`
 * ! Must be used in $group stage
 * @param typeField field name holding transaction type (income or expense)
 * @param amountField field name holding transaction amount
 * @returns
 */
const generateStatsIncomeExpense = (
  typeField: string,
  amountField: string
) => ({
  income: {
    $sum: {
      $cond: [
        {
          $eq: [`$${typeField}`, 'income'],
        },
        `$${amountField}`,
        0,
      ],
    },
  },
  expense: {
    $sum: {
      $cond: [
        {
          $eq: [`$${typeField}`, 'expense'],
        },
        `$${amountField}`,
        0,
      ],
    },
  },
});

/**
 * Conditional aggregation to determine whether
 * transaciton is income or expense based on
 * attributes.amount.valueInBaseUnits
 */
const labelIO = () => ({
  $cond: [
    {
      $lt: ['$attributes.amount.valueInBaseUnits', 0],
    },
    'expense',
    'income',
  ],
});

/**
 * Pipeline stages to lookup transaction category ids to
 * prettify category names
 * @returns
 * @requires previous stages to output unmodified transaction documents
 */
const lookupCategoryNames = () => [
  {
    $fill: {
      output: {
        'relationships.category.data.type': {
          value: 'categories',
        },
        'relationships.category.data.id': {
          value: 'uncategorised',
        },
        'relationships.parentCategory.data.type': {
          value: 'categories',
        },
        'relationships.parentCategory.data.id': {
          value: 'uncategorised',
        },
      },
    },
  },
  {
    $lookup: {
      from: 'categories',
      localField: 'relationships.category.data.id',
      foreignField: '_id',
      as: 'categoryNames',
      pipeline: [
        {
          $lookup: {
            from: 'categories',
            localField: 'relationships.parent.data.id',
            foreignField: '_id',
            as: 'parent',
          },
        },
        {
          $unwind: {
            path: '$parent',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            category: '$attributes.name',
            parentCategory: '$parent.attributes.name',
          },
        },
      ],
    },
  },
  {
    $unwind: {
      path: '$categoryNames',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      'relationships.category.data.id': '$categoryNames.category',
      'relationships.parentCategory.data.id': '$categoryNames.parentCategory',
    },
  },
  {
    $project: {
      categoryNames: 0,
    },
  },
];

/**
 * Retrieves transactions between dates, with sorting
 * and readable category names
 * @param dateRange
 * @param options
 * @returns
 */
export const filterByDateRange = (
  options: TransactionRetrievalOptions,
  accountId?: string
) => {
  const { dateRange, sort, sortDir, limit, type, transactionType } = options;
  const sortBy =
    sort === 'amount'
      ? 'attributes.amount.valueInBaseUnits'
      : 'attributes.createdAt';
  const dir = sortDir === 'asc' ? 1 : -1;
  return [
    {
      $match: {
        'attributes.createdAt': {
          $gte: dateRange.from,
          $lt: dateRange.to,
        },
        ...(transactionType
          ? {
              'attributes.isCategorizable':
                transactionType === 'transactions' ? true : false,
            }
          : {}),
        ...(accountId ? { 'relationships.account.data.id': accountId } : {}),
        ...(type && filterIO(type)),
      },
    },
    ...lookupCategoryNames(),
    {
      $sort: {
        [sortBy]: dir,
      },
    },
    ...(limit ? [{ $limit: limit }] : []),
  ];
};

/**
 * Retrieve transactions by tag
 * @param tag
 * @returns
 */
export const filterByTag = (tag: string) => [
  {
    $match: {
      'relationships.tags.data.id': tag,
    },
  },
  ...lookupCategoryNames(),
  {
    $sort: {
      'attributes.createdAt': -1,
    },
  },
];

/**
 * Retrieve transactions by category
 * @param category
 * @returns
 */
export const filterByCategory = (
  category: string,
  type: TransactionCategoryType,
  options?: RetrievalOptions
) => {
  const { sort, limit } = options || {};
  return [
    {
      $match: {
        ...(type === 'child'
          ? { 'relationships.category.data.id': category }
          : { 'relationships.parentCategory.data.id': category }),
      },
    },
    ...lookupCategoryNames(),
    ...(sort
      ? [{ $sort: sort }]
      : [
          {
            $sort: {
              'attributes.createdAt': -1,
            },
          },
        ]),
    ...(limit ? [{ $limit: limit }] : []),
  ];
};

/**
 * Retrieves all unique tags
 * @returns
 */
export const findDistinctTags = () => [
  {
    $unwind: {
      path: '$relationships.tags.data',
    },
  },
  {
    $group: {
      _id: null,
      tags: {
        $addToSet: '$relationships.tags.data.id',
      },
    },
  },
  {
    $project: {
      _id: 0,
      tags: {
        $sortArray: { input: '$tags', sortBy: 1 },
      },
    },
  },
];

/**
 * Account balance over time
 * ! Note: timezone is currently hard-coded
 * @param from
 * @param to
 * @param accountId
 * @returns
 */
export const groupBalanceByDay = (dateRange: DateRange, accountId: string) => [
  {
    $match: {
      'relationships.account.data.id': accountId,
    },
  },
  {
    $group: {
      _id: {
        $dateTrunc: {
          date: '$attributes.createdAt',
          unit: 'day',
          // Change to 'Australia/Melbourne' if/when $densify accounts for DST
          timezone: '+10:00',
        },
      },
      amount: {
        $sum: '$attributes.amount.valueInBaseUnits',
      },
    },
  },
  {
    $densify: {
      field: '_id',
      range: {
        step: 1,
        unit: 'day',
        bounds: 'full',
      },
    },
  },
  {
    $addFields: {
      amount: {
        $cond: [
          {
            $not: ['$amount'],
          },
          0,
          '$amount',
        ],
      },
    },
  },
  {
    $setWindowFields: {
      sortBy: {
        _id: 1,
      },
      output: {
        amountCumulative: {
          $sum: '$amount',
          window: {
            documents: ['unbounded', 'current'],
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      Timestamp: '$_id',
      Year: {
        $year: {
          date: '$_id',
          timezone: TZ,
        },
      },
      Month: {
        $month: {
          date: '$_id',
          timezone: TZ,
        },
      },
      Day: {
        $dayOfMonth: {
          date: '$_id',
          timezone: TZ,
        },
      },
      Amount: {
        $divide: ['$amount', 100],
      },
      Balance: {
        $divide: ['$amountCumulative', 100],
      },
    },
  },
  {
    $match: {
      Timestamp: {
        $gte: dateRange.from,
        $lt: dateRange.to,
      },
    },
  },
];

/**
 * Merchant expenditure by month
 * @param merchant
 * @param dateRange from should be start of month
 * @returns
 */
export const groupMerchantByDay = (
  merchant: string,
  dateRange: DateRange,
  earliestTx?: Date
) => [
  {
    $match: {
      'attributes.description': merchant,
    },
  },
  {
    $group: {
      _id: {
        $dateTrunc: {
          date: '$attributes.createdAt',
          unit: 'month',
        },
      },
      amount: {
        $sum: '$attributes.amount.valueInBaseUnits',
      },
    },
  },
  {
    $densify: {
      field: '_id',
      range: {
        step: 1,
        unit: 'month',
        bounds:
          earliestTx && earliestTx < dateRange.from
            ? [startOfMonth(earliestTx, { in: tz('+00:00') }), dateRange.to]
            : [dateRange.from, dateRange.to],
      },
    },
  },
  {
    $addFields: {
      amount: {
        $cond: [
          {
            $not: ['$amount'],
          },
          0,
          '$amount',
        ],
      },
    },
  },
  {
    $setWindowFields: {
      sortBy: {
        _id: 1,
      },
      output: {
        amountCumulative: {
          $sum: '$amount',
          window: {
            documents: ['unbounded', 'current'],
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      Timestamp: '$_id',
      Year: {
        $year: {
          date: '$_id',
        },
      },
      Month: {
        $month: {
          date: '$_id',
        },
      },
      Day: {
        $dayOfMonth: {
          date: '$_id',
        },
      },
      Amount: {
        $divide: ['$amount', 100],
      },
      Balance: {
        $abs: {
          $divide: ['$amountCumulative', 100],
        },
      },
    },
  },
];

/**
 * Pipeline for calculating number of transactions
 * and total spending per transaction category for
 * specified account
 * @param from
 * @param to
 * @param accountId account ID
 * @param type category type
 * @returns aggregation pipeline definition
 */
export const groupByCategory = (
  dateRange: DateRange,
  type: 'child' | 'parent',
  options: RetrievalOptions,
  parentCategory?: string,
  accountId?: string
) => {
  const { match, limit, sort } = options;
  return [
    /**
     * Match documents within the desired date range
     * and filter transfers
     */
    {
      $match: {
        'attributes.createdAt': {
          $gte: dateRange.from,
          $lte: dateRange.to,
        },
        'attributes.isCategorizable': true,
        // ! Exclude income
        'attributes.transactionType': {
          $nin: ['Salary', 'Direct Credit'],
        },
        ...(accountId && { 'relationships.account.data.id': accountId }),
        ...(parentCategory && {
          'relationships.parentCategory.data.id': parentCategory,
        }),
        ...(match && match),
      },
    },
    // Project only the necessary fields for further processing
    {
      $project: {
        category: {
          $ifNull: [
            type === 'parent'
              ? '$relationships.parentCategory.data.id'
              : '$relationships.category.data.id',
            'uncategorised',
          ],
        },
        amount: {
          $toDecimal: '$attributes.amount.value',
        },
      },
    },
    // Group documents by category and calculate the total amount and count
    {
      $group: {
        _id: '$category',
        amount: {
          $sum: '$amount',
        },
        transactions: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind:
        // So unnecessary!
        {
          path: '$category',
          preserveNullAndEmptyArrays: false,
        },
    },
    // Project the final result
    {
      $project: {
        _id: 0,
        category: '$_id',
        categoryName: {
          $ifNull: ['$category.attributes.name', 'Uncategorised'],
        },
        parentCategory: '$category.relationships.parent.data.id',
        amount: { $toDouble: '$amount' },
        absAmount: {
          $abs: {
            $toDouble: '$amount',
          },
        },
        transactions: 1,
      },
    },
    ...(sort
      ? [{ $sort: sort }]
      : [
          {
            $sort: {
              amount: -1,
              transactions: -1,
            },
          },
        ]),
    ...(limit ? [{ $limit: limit }] : []),
  ];
};

/**
 * Number of expenses and total spending per
 * transaction category grouped by day/month/year
 * for specified account
 * @param options
 * @param type category type
 * @param dateRange
 * @param accountId
 * @returns aggregation pipeline definition
 */
export const groupByCategoryAndDate = (
  options: RetrievalOptions,
  type: 'child' | 'parent',
  dateRange?: DateRange,
  accountId?: string
) => {
  const { match, groupBy } = options;
  return [
    {
      $match: {
        ...(dateRange && {
          'attributes.createdAt': {
            $gte: dateRange.from,
            $lte: dateRange.to,
          },
        }),
        ...(accountId && { 'relationships.account.data.id': accountId }),
        'attributes.isCategorizable': true,
        // ! Exclude income
        'attributes.transactionType': {
          $nin: ['Salary', 'Direct Credit'],
        },
        ...(match && match),
      },
    },
    // Grab month, year, category and amount
    {
      $project: {
        ...(groupBy === 'daily' && {
          day: {
            $dayOfMonth: {
              date: '$attributes.createdAt',
              timezone: TZ,
            },
          },
        }),
        ...((groupBy === 'daily' || groupBy === 'monthly') && {
          month: {
            $month: {
              date: '$attributes.createdAt',
              timezone: TZ,
            },
          },
        }),
        year: {
          $year: {
            date: '$attributes.createdAt',
            timezone: TZ,
          },
        },
        category: {
          $ifNull: [
            type === 'parent'
              ? '$relationships.parentCategory.data.id'
              : '$relationships.category.data.id',
            'uncategorised',
          ],
        },
        amount: {
          $toDecimal: '$attributes.amount.value',
        },
      },
    },
    // Group by month, year and category, sum amounts and no of transactions
    {
      $group: {
        _id: {
          day: '$day',
          month: '$month',
          year: '$year',
          category: '$category',
        },
        amount: {
          $sum: '$amount',
        },
        transactions: {
          $sum: 1,
        },
      },
    },
    // Converting category ids to names
    {
      $lookup: {
        from: 'categories',
        localField: '_id.category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: {
        path: '$category',
        preserveNullAndEmptyArrays: false,
      },
    },
    // Set uncategorised transactions
    {
      $project: {
        category: {
          $ifNull: ['$category._id', 'uncategorised'],
        },
        categoryName: {
          $ifNull: ['$category.attributes.name', 'Uncategorised'],
        },
        amount: {
          $toDouble: '$amount',
        },
        transactions: 1,
      },
    },
    // Group by month to collate categories by each month
    {
      $group: {
        _id: {
          day: '$_id.day',
          month: '$_id.month',
          year: '$_id.year',
        },
        categories: {
          $addToSet: {
            category: '$category',
            categoryName: '$categoryName',
            amount: '$amount',
            absAmount: {
              $abs: '$amount',
            },
            transactions: '$transactions',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        day: '$_id.day',
        month: '$_id.month',
        year: '$_id.year',
        categories: '$categories',
      },
    },
    {
      $sort: {
        year: 1,
        month: 1,
        day: 1,
      },
    },
  ];
};

/**
 * Group transactions by day
 * @param accountId
 * @param dateRange
 * @param options
 * @returns limit otherwise last 60 days
 */
export const groupByDay = (
  options?: RetrievalOptions,
  dateRange?: DateRange,
  accountId?: string
) => {
  return [
    {
      $match: {
        ...(dateRange && {
          'attributes.createdAt': {
            $gte: dateRange.from,
            $lte: dateRange.to,
          },
        }),
        ...(accountId && { 'relationships.account.data.id': accountId }),
        ...(options?.match && options.match),
      },
    },
    {
      $sort: {
        'attributes.createdAt': -1,
      },
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: '$attributes.createdAt',
            unit: 'day',
            timezone: TZ,
          },
        },
        transactions: {
          $push: '$$ROOT',
        },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: '$_id',
        transactions: '$transactions',
      },
    },
    {
      $sort: (options && options.sort) || { timestamp: -1 },
    },
    {
      // Number of days to return, default 60
      $limit: (options && options.limit) || 60,
    },
  ];
};

/**
 * Stats grouped by transaction description
 * (which is typically the merchant name)
 * @param from
 * @param to
 * @param accountId
 * @returns
 */
export const groupByMerchant = (
  options: RetrievalOptions,
  dateRange?: DateRange,
  accountId?: string,
  type?: TransactionIOEnum
) => {
  const { match, limit, sort } = options;
  return [
    {
      $match: {
        'attributes.isCategorizable': true,
        ...(dateRange && {
          'attributes.createdAt': {
            $gte: dateRange.from,
            $lte: dateRange.to,
          },
        }),
        ...(accountId && {
          'relationships.account.data.id': accountId,
        }),
        ...(match && match),
        ...(type && filterIO(type)),
      },
    },
    {
      $sort: {
        'attributes.createdAt': 1,
      },
    },
    {
      $group: {
        _id: { $ifNull: ['$attributes.description', 'Unidentified Merchant'] },
        amount: {
          $sum: '$attributes.amount.valueInBaseUnits',
        },
        transactions: {
          $sum: 1,
        },
        category: {
          $last: '$relationships.category.data.id',
        },
        parentCategory: {
          $last: '$relationships.parentCategory.data.id',
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        amount: {
          $divide: ['$amount', 100],
        },
        absAmount: {
          $abs: {
            $divide: ['$amount', 100],
          },
        },
        transactions: 1,
        category: {
          $ifNull: ['$category', 'uncategorised'],
        },
        parentCategory: {
          $ifNull: ['$parentCategory', 'uncategorised'],
        },
      },
    },
    ...(sort
      ? [{ $sort: sort }]
      : [
          {
            $sort: {
              amount: -1,
              transactions: -1,
            },
          },
        ]),
    ...(limit ? [{ $limit: limit }] : []),
  ];
};

/**
 * Transaction IDs grouped by tag
 * @returns
 */
export const groupByTag = () => [
  /**
   * Match only documents that have a tag
   */
  {
    $match: {
      'relationships.tags.data.0': {
        $exists: true,
      },
    },
  },
  {
    $project: {
      tags: '$relationships.tags.data',
    },
  },
  {
    $unwind: {
      path: '$tags',
      preserveNullAndEmptyArrays: false,
    },
  },
  {
    $group: {
      _id: '$tags.id',
      transactions: {
        $addToSet: '$_id',
      },
    },
  },
  {
    $project: {
      _id: 0,
      tag: '$_id',
      transactions: '$transactions',
    },
  },
];

/**
 * Retrieves transactions based on search term
 * using Atlas Search
 * @param searchTerm
 * @returns
 */
export const searchTransactions = (searchTerm: string) => [
  {
    $search: {
      index: 'transactions-index',
      text: {
        query: searchTerm,
        path: {
          wildcard: '*',
        },
        fuzzy: {
          maxEdits: 1,
        },
      },
    },
  },
  ...lookupCategoryNames(),
  {
    $sort: {
      'attributes.createdAt': -1,
    },
  },
];

/**
 * Creates pipeline for calculating total income,
 * expenditure and number of transactions per month
 * between from and to dates (excluding transfers)
 * for specified account
 * @param accountId account ID
 * @param dateRange date range
 * @param groupBy how to group stats
 * @returns aggregation pipeline definition
 */
export const statsIO = (
  options: RetrievalOptions,
  dateRange?: DateRange,
  avg?: boolean,
  accountId?: string,
  accountType?: string
) => {
  const { groupBy, match } = options;
  return [
    /**
     * Match documents within the desired date range
     * and filter transfers
     */
    {
      $match: {
        ...(dateRange && {
          'attributes.createdAt': {
            $gte: dateRange.from,
            $lte: dateRange.to,
          },
        }),
        ...(accountId && {
          'relationships.account.data.id': accountId,
        }),
        // TODO: Toggle filtering transfers
        ...(!accountId ||
        accountId === process.env.UP_TRANS_ACC ||
        accountType === 'TRANSACTIONAL'
          ? {
              'attributes.isCategorizable': true,
            }
          : {}),
        ...(match && match),
      },
    },
    {
      $project: {
        ...(groupBy === 'daily' && {
          day: {
            $dayOfMonth: {
              date: '$attributes.createdAt',
              timezone: TZ,
            },
          },
        }),
        ...((groupBy === 'daily' || groupBy === 'monthly') && {
          month: {
            $month: {
              date: '$attributes.createdAt',
              timezone: TZ,
            },
          },
        }),
        ...(groupBy && {
          year: {
            $year: {
              date: '$attributes.createdAt',
              timezone: TZ,
            },
          },
        }),
        amount: '$attributes.amount.valueInBaseUnits',
        type: labelIO(),
      },
    },
    // Group documents by month-year and type, calculate grouped income, expenses and number of transactions
    {
      $group: {
        _id: {
          day: '$day',
          month: '$month',
          year: '$year',
        },
        ...generateStatsIncomeExpense('type', 'amount'),
        transactions: {
          $sum: 1,
        },
      },
    },
    // Optionally average the results
    ...(avg
      ? [
          {
            $group: {
              _id: 0,
              income: {
                $avg: '$income',
              },
              expense: {
                $avg: '$expense',
              },
              transactions: {
                $avg: '$transactions',
              },
            },
          },
        ]
      : []),
    {
      $project: {
        _id: 0,
        Year: '$_id.year',
        Month: '$_id.month',
        In: {
          $divide: ['$income', 100],
        },
        Out: {
          $abs: {
            $divide: ['$expense', 100],
          },
        },
        Net: {
          $divide: [
            {
              $sum: ['$income', '$expense'],
            },
            100,
          ],
        },
        Transactions: '$transactions',
      },
    },
    {
      $sort: {
        Year: 1,
        Month: 1,
      },
    },
  ];
};

/**
 * Generates stats for a specific tag
 * @param tagId
 * @param monthly
 * @returns
 */
export const statsByTag = (tagId: string) => [
  {
    $match: {
      'relationships.tags.data.id': tagId,
    },
  },
  {
    $project: {
      amount: '$attributes.amount.valueInBaseUnits',
      type: labelIO(),
    },
  },
  {
    $group: {
      _id: 0,
      ...generateStatsIncomeExpense('type', 'amount'),
      transactions: {
        $sum: 1,
      },
    },
  },
  {
    $project: {
      _id: 0,
      Income: {
        $divide: ['$income', 100],
      },
      Expenses: {
        $divide: ['$expense', 100],
      },
      Net: {
        $divide: [
          {
            $sum: ['$income', '$expense'],
          },
          100,
        ],
      },
      Transactions: '$transactions',
    },
  },
];

/**
 * Cumulative income or expenses
 * @param dateRange
 * @param accountId
 * @param type
 * @returns
 */
export const sumIOByDay = (
  dateRange: DateRange,
  accountId: string,
  type: TransactionIOEnum
) => {
  // $densify doesn't play nicely with timezone offsets for some reason, anyway ...
  const utcFrom = new TZDate(
    dateRange.from.getUTCFullYear(),
    dateRange.from.getUTCMonth(),
    dateRange.from.getUTCDate(),
    '+00:00'
  );
  return [
    {
      $match: {
        'attributes.isCategorizable': true,
        'attributes.createdAt': {
          $gte: dateRange.from,
          $lte: dateRange.to,
        },
        'relationships.account.data.id': accountId,
        ...filterIO(type),
      },
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: '$attributes.createdAt',
            unit: 'day',
          },
        },
        amount: {
          $sum: '$attributes.amount.valueInBaseUnits',
        },
      },
    },
    {
      $densify: {
        field: '_id',
        range: {
          step: 1,
          unit: 'day',
          bounds: [
            // Dates must be UTC (GMT+0)
            utcFrom,
            dateRange.to,
          ],
        },
      },
    },
    {
      $addFields: {
        amount: {
          $cond: [
            {
              $not: ['$amount'],
            },
            0,
            '$amount',
          ],
        },
      },
    },
    {
      $setWindowFields: {
        sortBy: {
          _id: 1,
        },
        output: {
          amountCumulative: {
            $sum: '$amount',
            window: {
              documents: ['unbounded', 'current'],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        Timestamp: '$_id',
        AmountCumulative: {
          $abs: {
            $divide: ['$amountCumulative', 100],
          },
        },
      },
    },
  ];
};
