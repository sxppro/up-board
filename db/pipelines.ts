import { TransactionSortOptions } from '@/types/custom';

/**
 * Creates pipeline for calculating total income,
 * expenditure and number of transactions per month
 * between from and to dates (excluding transfers)
 * for specified account
 * @param from
 * @param to
 * @param accountId account ID
 * @returns aggregation pipeline definition
 */
const monthlyStatsPipeline = (from: Date, to: Date, accountId: string) => [
  /**
   * Match documents within the desired date range
   * and filter transfers
   */
  {
    $match: {
      'relationships.account.data.id': accountId,
      'attributes.createdAt': {
        $gte: from,
        $lte: to,
      },
      'attributes.isCategorizable': true,
    },
  },
  {
    $project: {
      month: {
        $month: {
          date: '$attributes.createdAt',
          timezone: 'Australia/Melbourne',
        },
      },
      year: {
        $year: {
          date: '$attributes.createdAt',
          timezone: 'Australia/Melbourne',
        },
      },
      amount: '$attributes.amount.valueInBaseUnits',
      type: {
        $cond: [
          {
            $lt: ['$attributes.amount.valueInBaseUnits', 0],
          },
          'expense',
          'income',
        ],
      },
    },
  },
  // Group documents by month-year and type, calculate grouped income, expenses and number of transactions
  {
    $group: {
      _id: {
        month: '$month',
        year: '$year',
      },
      income: {
        $sum: {
          $cond: [
            {
              $eq: ['$type', 'income'],
            },
            '$amount',
            0,
          ],
        },
      },
      expense: {
        $sum: {
          $cond: [
            {
              $eq: ['$type', 'expense'],
            },
            '$amount',
            0,
          ],
        },
      },
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
 * Pipeline for calculating number of transacrtions
 * and total spending per transaction category for
 * specified account
 * @param from
 * @param to
 * @param accountId account ID
 * @param type category type
 * @returns aggregation pipeline definition
 */
const categoriesPipeline = (
  from: Date,
  to: Date,
  accountId: string,
  type: 'child' | 'parent'
) => [
  /**
   * Match documents within the desired date range
   * and filter transfers
   */
  {
    $match: {
      'relationships.account.data.id': accountId,
      'attributes.createdAt': {
        $gte: from,
        $lte: to,
      },
      'attributes.isCategorizable': true,
      // Only expenses
      'attributes.amount.valueInBaseUnits': {
        $lt: 0,
      },
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
  // Group documents by month and type and calculate the total amount and count
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
  {
    $sort: {
      amount: -1,
      transactions: -1,
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
const accountBalancePipeline = (from: Date, to: Date, accountId: string) => [
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
          timezone: 'Australia/Melbourne',
        },
      },
      Month: {
        $month: {
          date: '$_id',
          timezone: 'Australia/Melbourne',
        },
      },
      Day: {
        $dayOfMonth: {
          date: '$_id',
          timezone: 'Australia/Melbourne',
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
 * Retrieves transactions between dates, with sorting
 * @param from
 * @param to
 * @param sortOptions
 * @returns
 */
const transactionsByDatePipeline = (
  from: Date,
  to: Date,
  sortOptions: TransactionSortOptions
) => {
  const { sort, sortDir } = sortOptions;
  const sortBy =
    sort === 'amount'
      ? 'attributes.amount.valueInBaseUnits'
      : 'attributes.createdAt';
  const dir = sortDir === 'asc' ? 1 : -1;
  return [
    {
      $match: {
        'attributes.createdAt': {
          $gte: from,
          $lt: to,
        },
      },
    },
    {
      $sort: {
        [sortBy]: dir,
      },
    },
  ];
};

/**
 * Pipeline for retrieving transaction
 * IDs grouped by tag
 * @returns
 */
const transactionsByTagsPipeline = () => [
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
const searchTransactionsPipeline = (searchTerm: string) => [
  {
    $search: {
      index: 'transactions-index',
      text: {
        query: searchTerm,
        path: {
          wildcard: '*',
        },
      },
    },
  },
  {
    $sort: {
      'attributes.createdAt': -1,
    },
  },
];

export {
  accountBalancePipeline,
  categoriesPipeline,
  monthlyStatsPipeline,
  searchTransactionsPipeline,
  transactionsByDatePipeline,
  transactionsByTagsPipeline,
};
