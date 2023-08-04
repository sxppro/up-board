/**
 * Creates pipeline for calculating total income,
 * expenditure and number of transactions per month
 * between start and end dates (excluding transfers)
 * @param start
 * @param end
 * @returns aggregation pipeline definition
 */
const monthlyStatsPipeline = (start: Date, end: Date) => [
  /**
   * Match documents within the desired date range
   * and filter transfers
   */
  {
    $match: {
      'attributes.createdAt': {
        $gte: start,
        $lte: end,
      },
      'attributes.description': {
        // Match those NOT starting with ...
        $regex:
          '^(?!(Transfer from|Auto Transfer from|Transfer to|Auto Transfer to|Forward to)).+',
      },
    },
  },
  // Project only the necessary fields for further processing
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
      amount: {
        $toDecimal: '$attributes.amount.value',
      },
      type: {
        $cond: [
          {
            $lt: [
              {
                $toDecimal: '$attributes.amount.value',
              },
              0,
            ],
          },
          'expense',
          'income',
        ],
      },
    },
  },
  // Group documents by month and type and calculate the total amount and count
  {
    $group: {
      _id: {
        month: '$month',
        year: '$year',
      },
      income: {
        $sum: {
          $cond: [{ $eq: ['$type', 'income'] }, '$amount', { $toDecimal: '0' }],
        },
      },
      expense: {
        $sum: {
          $cond: [
            { $eq: ['$type', 'expense'] },
            '$amount',
            { $toDecimal: '0' },
          ],
        },
      },
      transactions: { $sum: 1 },
    },
  },
  // Project the final result
  {
    $project: {
      _id: 0, // Exclude the default _id field from the result
      month: '$_id.month',
      year: '$_id.year',
      income: '$income',
      expense: '$expense',
      transactions: 1,
    },
  },
  // Sort the results by month
  {
    $sort: {
      year: 1,
      month: 1,
    },
  },
];

export { monthlyStatsPipeline };
