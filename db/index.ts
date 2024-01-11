import { CategoryOption, DbTransactionResource } from '@/types/custom';
import { components } from '@/types/up-api';
import { outputTransactionFields } from '@/utils/helpers';
import { UUID } from 'bson';
import { MongoBulkWriteError } from 'mongodb';
import { DateRange } from 'react-day-picker';
import { connectToDatabase } from './connect';
import {
  accountBalancePipeline,
  categoriesPipeline,
  monthlyStatsPipeline,
  transactionsByTagsPipeline,
} from './pipelines';

/**
 * Inserts transactions to db
 * @param data list of transactions
 */
const insertTransactions = async (
  data: components['schemas']['TransactionResource'][]
) => {
  if (data.length < 1) {
    return;
  }
  try {
    const { db } = await connectToDatabase('up');
    const transactions = db.collection<DbTransactionResource>('transactions');
    /**
     * Remaps id to _id as BSON UUID & ISO date strings
     * to BSON dates for better query performance
     * @see https://mongodb.github.io/node-mongodb-native/5.1/classes/BSON.UUID.html
     */
    const parsedData: DbTransactionResource[] = data.map(
      ({ id, attributes, ...rest }) => {
        const { createdAt, settledAt } = attributes;
        const newAttributes = {
          ...attributes,
          createdAt: new Date(createdAt),
          settledAt: settledAt ? new Date(settledAt) : null,
        };
        return {
          _id: new UUID(id).toBinary(),
          attributes: newAttributes,
          ...rest,
        };
      }
    );
    const insert = await transactions.insertMany(parsedData, {
      ordered: false,
    });
    return insert;
  } catch (err) {
    // Catch duplicate key errors
    if (err instanceof MongoBulkWriteError && err.code === 11000) {
      const { insertedCount, insertedIds } = err;
      return {
        acknowledged: true,
        insertedCount,
        insertedIds,
      };
    } else {
      console.error(err);
    }
  }
};

/**
 * Monthly transaction statistics between 2 dates
 * @param start start date
 * @param end end date
 * @returns list of stats for each month
 */
const monthlyStats = async (start: Date, end: Date) => {
  if (!process.env.UP_TRANS_ACC) {
    throw new Error('Up transaction account not defined');
  }

  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate(
    monthlyStatsPipeline(start, end, process.env.UP_TRANS_ACC)
  );
  const results = await cursor.toArray();
  return results;
};

/**
 * Generates category stats for transactions
 * between 2 dates
 * @param start
 * @param end
 * @returns list of stats for each category
 */
const categoryStats = async (
  start: Date,
  end: Date,
  type: 'child' | 'parent'
) => {
  if (!process.env.UP_TRANS_ACC) {
    throw new Error('Up transaction account not defined');
  }

  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate(
    categoriesPipeline(start, end, process.env.UP_TRANS_ACC, type)
  );
  const results = await cursor.toArray();
  return results;
};

/**
 * Retrieves transactions between 2 dates
 * @param start
 * @param end
 * @returns
 */
const getTransactionsByDate = async (
  date: DateRange,
  sortOptions: { sort: 'time' | 'amount'; sortDir: 'asc' | 'desc' }
) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions
    .find({
      'attributes.createdAt': { $gte: date.from, $lte: date.to },
      'attributes.isCategorizable': true,
    })
    .sort(
      sortOptions.sort === 'time'
        ? 'attributes.createdAt'
        : 'attributes.amount.valueInBaseUnits',
      sortOptions.sortDir === 'asc' ? 1 : -1
    );
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves transactions by category
 * @param category category id
 * @returns list of transactions
 */
const getTransactionsByCategory = async (category: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.find({ $text: { $search: category } });
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves transaction data by id
 * @param id transaction id
 * @returns transaction document
 */
const getTransactionById = async (id: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const result = await transactions.findOne({ _id: new UUID(id).toBinary() });
  return result ? outputTransactionFields(result) : result;
};

/**
 * Retrieves transactions by tags
 * @returns
 */
const getTransactionsByTag = async () => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate(transactionsByTagsPipeline());
  const results = await cursor.toArray();
  await cursor.close();
  return results;
};

/**
 * Retrieves child categories
 * @returns
 */
const getChildCategories = async () => {
  const { db } = await connectToDatabase('up');
  const categories = db.collection('categories');
  const cursor = categories
    .find({
      'relationships.parent.data': { $ne: null },
    })
    .sort({ 'attributes.name': 1 })
    .project({ _id: 0, value: '$_id', name: '$attributes.name' });
  const results = (await cursor.toArray()) as CategoryOption[];
  return results;
};

/**
 * Retrieves parent categories
 * @returns
 */
const getParentCategories = async () => {
  const { db } = await connectToDatabase('up');
  const categories = db.collection('categories');
  const cursor = categories
    .find({ 'relationships.parent.data': null })
    .project({ _id: 0, value: '$_id', name: '$attributes.name' });
  const results = (await cursor.toArray()) as CategoryOption[];
  return results;
};

/**
 * Retrieves bank transfers by account and date range
 * @param accountId
 * @param from
 * @param to
 * @returns
 */
const getTransfers = async (dateRange: DateRange) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.find({
    'relationships.account.data.id': process.env.UP_TRANS_ACC,
    'attributes.isCategorizable': false,
    'attributes.createdAt': {
      $gte: dateRange.from,
      $lt: dateRange.to,
    },
  });
  const results = (await cursor.toArray()).map((transaction) =>
    outputTransactionFields(transaction)
  );
  await cursor.close();
  return results;
};

/**
 * Retrieves account balance between 2 dates
 * @param start
 * @param end
 * @param accountId
 * @returns
 */
const getAccountBalance = async (
  start: Date,
  end: Date,
  account: 'transactional' | 'savings'
) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<DbTransactionResource>('transactions');
  const cursor = transactions.aggregate(
    accountBalancePipeline(
      start,
      end,
      (account === 'transactional'
        ? process.env.UP_TRANS_ACC
        : process.env.UP_SAVINGS_ACC) || ''
    )
  );
  const results = await cursor.toArray();
  await cursor.close();
  return results;
};

export {
  categoryStats,
  getAccountBalance,
  getChildCategories,
  getParentCategories,
  getTransactionById,
  getTransactionsByCategory,
  getTransactionsByDate,
  getTransactionsByTag,
  getTransfers,
  insertTransactions,
  monthlyStats,
};
