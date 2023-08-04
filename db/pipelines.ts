/**
 * Creates pipeline for incoming transactions
 * between start and end dates (excluding transfers)
 * @param start
 * @param end
 * @returns aggregation pipeline
 */
const transactionsIn = (start: Date, end: Date) => [
  {
    $match: {
      'attributes.createdAt': {
        $gte: start,
        $lte: end,
      },
    },
  },
  {
    $addFields: {
      'attributes.amount.decValue': {
        $toDecimal: '$attributes.amount.value',
      },
    },
  },
  {
    $match: {
      'attributes.amount.decValue': {
        $gt: 0,
      },
      'attributes.description': {
        $regex: '^(?!(Transfer from|Auto Transfer from)).+',
      },
    },
  },
  {
    $group: {
      _id: null,
      value: {
        $sum: '$attributes.amount.decValue',
      },
    },
  },
];

/**
 * Creates pipeline for outgoing transactions
 * between start and end dates (excluding transfers)
 * @param start
 * @param end
 * @returns aggregation pipeline
 */
const transactionsOut = (start: Date, end: Date) => [
  {
    $match: {
      'attributes.createdAt': {
        $gte: start,
        $lte: end,
      },
    },
  },
  {
    $addFields: {
      'attributes.amount.decValue': {
        $toDecimal: '$attributes.amount.value',
      },
    },
  },
  {
    $match: {
      'attributes.amount.decValue': {
        $lt: 0,
      },
      'attributes.description': {
        $regex: '^(?!(Transfer to|Auto Transfer to)).+',
      },
    },
  },
  {
    $group: {
      _id: null,
      value: {
        $sum: '$attributes.amount.decValue',
      },
    },
  },
];

export { transactionsIn, transactionsOut };
