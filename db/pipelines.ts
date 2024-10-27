import {
  DateRange,
  DateRangeGroupBy,
  RetrievalOptions,
  TransactionIOEnum,
  TransactionRetrievalOptions,
} from '@/server/schemas';
import { TZ } from '@/utils/constants';
import { UTCDate } from '@date-fns/utc';

/**
 * Generates total income and expense statistics
 * for transactions labelled by `labelIncomeExpense`
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
const labelIncomeExpense = () => ({
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
const lookupTransactionCategories = () => [
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
 * Cumulative income or expenses
 * @param dateRange
 * @param accountId
 * @param type
 * @returns
 */
export const cumulativeIOByDay = (
  dateRange: DateRange,
  accountId: string,
  type: TransactionIOEnum
) => {
  // $densify doesn't play nicely with timezone offsets for some reason, anyway ...
  const utcFrom = new UTCDate(
    dateRange.from.getUTCFullYear(),
    dateRange.from.getUTCMonth(),
    dateRange.from.getUTCDate()
  );
  return [
    {
      $match: {
        'attributes.isCategorizable': true,
        'attributes.createdAt': {
          $gte: dateRange.from,
          $lte: dateRange.to,
        },
        'attributes.amount.valueInBaseUnits': {
          ...(type === 'income' ? { $gt: 0 } : { $lt: 0 }),
        },
        'relationships.account.data.id': accountId,
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
        ...(type
          ? type === 'income'
            ? { 'attributes.amount.valueInBaseUnits': { $gt: 0 } }
            : { 'attributes.amount.valueInBaseUnits': { $lt: 0 } }
          : []),
      },
    },
    ...lookupTransactionCategories(),
    {
      $sort: {
        [sortBy]: dir,
      },
    },
    ...(limit ? [{ $limit: limit }] : []),
  ];
};

/**
 * Retrieves all unique tags
 * @returns
 */
export const findUniqueTags = () => [
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
export const groupBalanceByDay = (from: Date, to: Date, accountId: string) => [
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
        $gte: from,
        $lt: to,
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
  accountId: string,
  type: 'child' | 'parent',
  options: RetrievalOptions,
  parentCategory?: string
) => {
  const { limit } = options;
  return [
    /**
     * Match documents within the desired date range
     * and filter transfers
     */
    {
      $match: {
        'relationships.account.data.id': accountId,
        'attributes.createdAt': {
          $gte: dateRange.from,
          $lte: dateRange.to,
        },
        'attributes.isCategorizable': true,
        // Only expenses
        'attributes.amount.valueInBaseUnits': {
          $lt: 0,
        },
        ...(parentCategory && {
          'relationships.parentCategory.data.id': parentCategory,
        }),
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
        amount: {
          $abs: {
            $toDouble: '$amount',
          },
        },
        transactions: 1,
      },
    },
    {
      $sort: {
        amount: -1,
        transactions: -1,
      },
    },
    ...(limit ? [{ $limit: limit }] : []),
  ];
};

/**
 * Pipeline for calculating number of transactions
 * and total spending per transaction category
 * per month for specified account
 * @param from
 * @param to
 * @param accountId account ID
 * @param type category type
 * @returns aggregation pipeline definition
 */
export const groupByCategoryAndMonth = (
  from: Date,
  to: Date,
  accountId: string,
  type: 'child' | 'parent'
) => [
  {
    $match: {
      'relationships.account.data.id': accountId,
      'attributes.createdAt': {
        $gte: from,
        $lte: to,
      },
      'attributes.isCategorizable': true,
      'attributes.amount.valueInBaseUnits': {
        $lt: 0,
      },
    },
  },
  // Grab month, year, category and amount
  {
    $project: {
      month: {
        $month: {
          date: '$attributes.createdAt',
          timezone: TZ,
        },
      },
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
        $ifNull: ['$category.attributes.name', 'Uncategorised'],
      },
      amount: {
        $abs: {
          $toDouble: '$amount',
        },
      },
      transactions: 1,
    },
  },
  // Group by month to collate categories by each month
  {
    $group: {
      _id: {
        month: '$_id.month',
        year: '$_id.year',
      },
      categories: {
        $addToSet: {
          category: '$category',
          amount: '$amount',
          transactions: '$transactions',
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      month: '$_id.month',
      year: '$_id.year',
      categories: '$categories',
    },
  },
  {
    $sort: {
      year: 1,
      month: 1,
    },
  },
];

/**
 * Stats grouped by transaction description
 * (which is typically the merchant name)
 * @param from
 * @param to
 * @param accountId
 * @returns
 */
export const groupByMerchant = (
  dateRange: DateRange,
  accountId: string,
  options: RetrievalOptions,
  type?: TransactionIOEnum
) => {
  const { limit } = options;
  return [
    {
      $match: {
        'relationships.account.data.id': accountId,
        'attributes.createdAt': {
          $gte: dateRange.from,
          $lte: dateRange.to,
        },
        'attributes.isCategorizable': true,
        ...(type && {
          'attributes.amount.valueInBaseUnits': {
            ...(type === 'income' ? { $gt: 0 } : { $lt: 0 }),
          },
        }),
      },
    },
    {
      $project: {
        description: {
          $ifNull: ['$attributes.description', 'null'],
        },
        amount: {
          $toDecimal: '$attributes.amount.value',
        },
      },
    },
    {
      $group: {
        _id: '$description',
        amount: {
          $sum: '$amount',
        },
        transactions: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        description: '$_id',
        amount: {
          $abs: {
            $toDouble: '$amount',
          },
        },
        transactions: 1,
      },
    },
    {
      $sort: {
        amount: -1,
        transactions: -1,
      },
    },
    ...(limit ? [{ $limit: limit }] : [{ $limit: 5 }]),
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
  ...lookupTransactionCategories(),
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
export const statsByAccount = (
  accountId: string,
  dateRange: DateRange,
  groupBy?: DateRangeGroupBy
) => [
  /**
   * Match documents within the desired date range
   * and filter transfers
   */
  {
    $match: {
      'relationships.account.data.id': accountId,
      'attributes.createdAt': {
        $gte: dateRange.from,
        $lte: dateRange.to,
      },
      // TODO: Toggle filtering transfers
      ...(accountId === process.env.UP_TRANS_ACC && {
        'attributes.isCategorizable': true,
      }),
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
      type: labelIncomeExpense(),
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
  {
    $project: {
      _id: 0,
      Year: '$_id.year',
      Month: '$_id.month',
      Income: {
        $divide: ['$income', 100],
      },
      Expenses: {
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

/**
 * Generates stats for a specific tag
 * @param tagId
 * @param monthly
 * @returns
 */
export const statsByTag = (tagId: string, monthly?: boolean) => [
  {
    $match: {
      'attributes.isCategorizable': true,
      'relationships.tags.data.id': tagId,
    },
  },
  {
    $project: {
      amount: '$attributes.amount.valueInBaseUnits',
      type: labelIncomeExpense(),
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
        $abs: {
          $divide: ['$expense', 100],
        },
      },
      Transactions: '$transactions',
    },
  },
];
