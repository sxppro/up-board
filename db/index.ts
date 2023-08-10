import { CustomTransactionResource } from '@/types/custom';
import { components } from '@/types/up-api';
import { UUID } from 'bson';
import { MongoBulkWriteError, MongoClient } from 'mongodb';
import { categoriesPipeline, monthlyStatsPipeline } from './pipelines';

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
  process.env.DB_PASS || ''
)}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(DB_URI);

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
    const db = client.db('up');
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
    const insert = await transactions.insertMany(parsedData);
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
  const db = client.db('up');
  const transactions = db.collection<CustomTransactionResource>('transactions');
  const cursor = transactions.aggregate(monthlyStatsPipeline(start, end));
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
  const db = client.db('up');
  const transactions = db.collection<CustomTransactionResource>('transactions');
  const cursor = transactions.aggregate(categoriesPipeline(start, end));
  const results = await cursor.toArray();
  return results;
};

export { categoryStats, insertTransactions, monthlyStats };
