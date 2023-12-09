import { CategoryOption, CustomTransactionResource } from '@/types/custom';
import { components } from '@/types/up-api';
import { UUID } from 'bson';
import { MongoBulkWriteError } from 'mongodb';
import { connectToDatabase } from './connect';
import {
  categoriesPipeline,
  monthlyStatsPipeline,
  transactionsByTagsPipeline,
} from './pipelines';

/**
 * Converts BSON UUID to string
 * @param uuid to be converted
 * @returns uuid as string
 */
const uuidToString = (uuid: UUID) =>
  uuid
    .toString('hex')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

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
    const transactions =
      db.collection<CustomTransactionResource>('transactions');
    /**
     * Remaps id to _id as BSON UUID & ISO date strings
     * to BSON dates for better query performance
     * @see https://mongodb.github.io/node-mongodb-native/5.1/classes/BSON.UUID.html
     */
    const parsedData: CustomTransactionResource[] = data.map(
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
      // console.log(
      //   Object.keys(insertedIds).map((id) =>
      //     uuidToString(insertedIds[parseInt(id)])
      //   )
      // );
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
 * Generates monthly transaction statistics
 * between 2 dates
 * @param start start date
 * @param end end date
 * @returns list of stats for each month
 */
const monthlyStats = async (start: Date, end: Date) => {
  if (!process.env.UP_TRANS_ACC) {
    throw new Error('Up transaction account not defined');
  }

  const { db } = await connectToDatabase('up');
  const transactions = db.collection<CustomTransactionResource>('transactions');
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
const categoryStats = async (start: Date, end: Date) => {
  if (!process.env.UP_TRANS_ACC) {
    throw new Error('Up transaction account not defined');
  }

  const { db } = await connectToDatabase('up');
  const transactions = db.collection<CustomTransactionResource>('transactions');
  const cursor = transactions.aggregate(
    categoriesPipeline(start, end, process.env.UP_TRANS_ACC)
  );
  const results = await cursor.toArray();
  return results;
};

/**
 * Retrieves transaction data by id
 * @param id transaction id
 * @returns transaction document
 */
const getTransactionById = async (id: string) => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<CustomTransactionResource>('transactions');
  const results = await transactions.findOne({ _id: new UUID(id).toBinary() });
  return results;
};

/**
 * Retrieves transactions by tags
 * @returns
 */
const getTransactionsByTag = async () => {
  const { db } = await connectToDatabase('up');
  const transactions = db.collection<CustomTransactionResource>('transactions');
  const cursor = transactions.aggregate(transactionsByTagsPipeline());
  const results = await cursor.toArray();
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

export {
  categoryStats,
  getChildCategories,
  getParentCategories,
  getTransactionById,
  getTransactionsByTag,
  insertTransactions,
  monthlyStats,
};
