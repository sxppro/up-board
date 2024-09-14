import {
  TagInfo,
  TransactionCategoryInfoHistoryRaw,
  type AccountBalanceHistory,
  type AccountMonthlyInfo,
  type DateRange,
  type TransactionCategoryInfo,
  type TransactionCategoryOption,
  type TransactionCategoryType,
} from '@/server/schemas';
import {
  AccountInfo,
  AccountResource,
  DateRangeGroupBy,
  DbTransactionResource,
  TransactionRetrievalOptions,
} from '@/types/custom';
import { components } from '@/types/up-api';
import { auth } from '@/utils/auth';
import { outputTransactionFields } from '@/utils/helpers';
import { getTransactionById as getUpTransactionById } from '@/utils/up';
import { faker } from '@faker-js/faker';
import { UUID } from 'bson';
import { CollectionOptions, Document, MongoBulkWriteError } from 'mongodb';
import clientPromise from './connect';
import {
  accountBalancePipeline,
  accountStatsPipeline,
  categoriesByPeriodPipeline,
  categoriesPipeline,
  searchTransactionsPipeline,
  tagInfoPipeline,
  transactionsByDatePipeline,
  transactionsByTagsPipeline,
  uniqueTagsPipeline,
} from './pipelines';

/**
 * Creates a db instance
 * @returns
 */
const connectToDatabase = async (db: string) => {
  const client = await clientPromise;
  return client.db(db);
};

/**
 * Connects to a collection within a database
 * @param db Database name
 * @param collection Collection name
 * @param collectionOpts CollectionOptions
 * @returns
 */
const connectToCollection = async <T extends Document>(
  db: string,
  collection: string,
  collectionOpts?: CollectionOptions
) => {
  const session = await auth();
  if (!session) {
    throw new Error('unauthorised');
  }
  const database = await connectToDatabase(db);
  return database.collection<T>(collection, collectionOpts);
};

/**
 * Remaps transaction attributes from Up to be inserted to db
 * @param param0
 * @returns
 */
export const convertUpToDbTransaction = (
  transaction: components['schemas']['TransactionResource']
): DbTransactionResource => {
  const { id, attributes, ...rest } = transaction;
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
};

/**
 * Inserts transactions to db
 * @param data list of transactions
 */
export const insertTransactions = async (
  data: components['schemas']['TransactionResource'][]
) => {
  if (data.length < 1) {
    return;
  }
  try {
    const db = await connectToDatabase('up');
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
 * Replaces transactions in db by their ids
 * with data from Up
 * @param transactionIds array of transaction IDs
 * @returns number of transactions replaced
 */
export const replaceTransactions = async (transactionIds: string[]) => {
  try {
    const transactions = await connectToCollection('up', 'transactions');
    let replacedTransactions = 0;
    await Promise.all(
      transactionIds.map(async (id) => {
        const data = await getUpTransactionById(id);
        const replace = await transactions.replaceOne(
          {
            _id: new UUID(id).toBinary(),
          },
          convertUpToDbTransaction(data.data)
        );
        if (replace.acknowledged) {
          replacedTransactions += replace.modifiedCount;
        }
      })
    );
    return replacedTransactions;
  } catch (err) {
    return;
  }
};

/**
 * Search transactions
 * @param search
 * @returns
 */
export const searchTransactions = async (search: string) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<DbTransactionResource>(
      searchTransactionsPipeline(search)
    );
    const results = (await cursor.toArray()).map((transaction) =>
      outputTransactionFields(transaction)
    );
    return results;
  } catch (err) {
    return;
  }
};

/**
 * Monthly transaction statistics between 2 dates
 * @param dateRange
 * @returns list of stats for each month
 */
export const getMonthlyInfo = async (
  accountId: string,
  dateRange: DateRange,
  groupBy?: DateRangeGroupBy
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<AccountMonthlyInfo>(
      accountStatsPipeline(accountId, dateRange, groupBy)
    );
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    return [];
  }
};

/**
 * Generates category stats for transactions
 * between 2 dates
 * @param dateRange
 * @param type category type (subcategory or parent category)
 * @returns list of stats for each category
 */
export const getCategoryInfo = async (
  dateRange: DateRange,
  type: TransactionCategoryType,
  parentCategory?: string
) => {
  try {
    if (!process.env.UP_TRANS_ACC) {
      throw new Error('Up transaction account not defined');
    }
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<TransactionCategoryInfo>(
      categoriesPipeline(
        dateRange.from,
        dateRange.to,
        process.env.UP_TRANS_ACC,
        type,
        parentCategory
      )
    );
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    return [];
  }
};

/**
 * Generates category stats by month
 * @param dateRange
 * @param type category type (subcategory or parent category)
 * @returns
 */
export const getCategoryInfoHistory = async (
  dateRange: DateRange,
  type: TransactionCategoryType
) => {
  try {
    if (!process.env.UP_TRANS_ACC) {
      throw new Error('Up transaction account not defined');
    }
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<TransactionCategoryInfoHistoryRaw>(
      categoriesByPeriodPipeline(
        dateRange.from,
        dateRange.to,
        process.env.UP_TRANS_ACC,
        type
      )
    );
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    return [];
  }
};

/**
 * Retrieves income and expense stats for a tag
 * @param tag
 * @returns
 */
export const getTagInfo = async (tag: string): Promise<TagInfo> => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<TagInfo>(tagInfoPipeline(tag));
    const results = await cursor.toArray();
    return results[0];
  } catch (err) {
    return {
      Income: faker.number.float({ min: 0, max: 1000 }),
      Expenses: faker.number.float({ min: 0, max: 1000 }),
      Transactions: faker.number.int({ max: 100 }),
    };
  }
};

/**
 * Retrieves transactions between 2 dates
 * @param dateRange
 * @param options
 * @returns
 */
const getTransactionsByDate = async (
  account: string,
  dateRange: DateRange,
  options: TransactionRetrievalOptions
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<DbTransactionResource>(
      transactionsByDatePipeline(account, dateRange, options)
    );
    const results = (await cursor.toArray()).map((transaction) =>
      outputTransactionFields(transaction)
    );
    return results;
  } catch (err) {
    return;
  }
};

/**
 * Retrieves transactions by category
 * @param category category id
 * @returns list of transactions
 */
const getTransactionsByCategory = async (category: string) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.find({ $text: { $search: category } });
    const results = (await cursor.toArray()).map((transaction) =>
      outputTransactionFields(transaction)
    );
    return results;
  } catch (err) {
    return;
  }
};

/**
 * Retrieves transaction data by id
 * @param id transaction id
 * @returns transaction document
 */
const getTransactionById = async (id: string) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const result = await transactions.findOne({ _id: new UUID(id).toBinary() });
    return result ? outputTransactionFields(result) : result;
  } catch (err) {
    return;
  }
};

/**
 * Retrieves transactions by specific tag
 * @param tag
 * @returns
 */
export const getTransactionsByTag = async (tag: string) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.find({ 'relationships.tags.data.id': tag });
    const results = (await cursor.toArray()).map((transaction) =>
      outputTransactionFields(transaction)
    );
    return results;
  } catch (err) {
    return;
  }
};

/**
 * Retrieves transactions grouped by tags
 * @returns
 */
export const getTransactionsByTags = async () => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate(transactionsByTagsPipeline());
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    return [];
  }
};

/**
 * Retrieves category details
 * @param type child or parent categories
 * @returns
 */
export const getCategories = async (type: TransactionCategoryType) => {
  try {
    const categories = await connectToCollection('up', 'categories');
    const cursor = categories
      .find({
        'relationships.parent.data': type === 'child' ? { $ne: null } : null,
      })
      .sort({ 'attributes.name': 1 })
      .project<TransactionCategoryOption>({
        _id: 0,
        id: '$_id',
        value: '$attributes.name',
        name: '$attributes.name',
      });
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    return [
      {
        value: faker.commerce.department(),
        id: faker.commerce.isbn(),
        name: faker.commerce.department(),
      },
    ];
  }
};

/**
 * Retrieves all unique transaction tags
 */
export const getTags = async () => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<{ tags: string[] }>(
      uniqueTagsPipeline()
    );
    const results = await cursor.toArray();
    return results[0];
  } catch (err) {
    return {
      tags: [
        `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
      ],
    };
  }
};

/**
 * Retrieves bank transfers by account and date range
 * @returns
 */
const getTransfers = async (dateRange: DateRange) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
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
    return results;
  } catch (err) {
    return;
  }
};

/**
 * Retrieves list of accounts
 * @param accountType transactional or saver
 * @returns
 */
export const getAccounts = async (
  accountType?: components['schemas']['AccountTypeEnum']
) => {
  try {
    const accounts = await connectToCollection<AccountResource>(
      'up',
      'accounts'
    );
    const cursor = accounts
      .find(accountType ? { 'attributes.accountType': accountType } : {})
      .sort({ 'attributes.displayName': 1, 'attributes.accountType': 1 })
      .project<AccountInfo>({
        _id: 0,
        id: '$_id',
        displayName: '$attributes.displayName',
        accountType: '$attributes.accountType',
      });
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    return [
      {
        id: faker.string.uuid(),
        displayName: faker.finance.accountName(),
        accountType: faker.helpers.arrayElement(['TRANSACTIONAL', 'SAVER']),
      },
    ];
  }
};

/**
 * Retrieves account balance between 2 dates
 * @param start
 * @param end
 * @param accountId
 * @returns
 */
const getAccountBalance = async (dateRange: DateRange, accountId: string) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const cursor = transactions.aggregate<AccountBalanceHistory>(
      accountBalancePipeline(dateRange.from, dateRange.to, accountId)
    );
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    const date = faker.date.recent();
    return [
      {
        Year: date.getFullYear(),
        Month: date.getMonth() + 1,
        Day: date.getDate(),
        Timestamp: date,
        Amount: parseFloat(faker.finance.amount({ min: -1000 })),
        Balance: parseFloat(faker.finance.amount({ max: 100000 })),
      },
    ];
  }
};

/**
 * Retrieves specific account information
 * @param accountId UUID string
 * @returns
 */
export const getAccountById = async (accountId: string) => {
  try {
    const accounts = await connectToCollection<AccountResource>(
      'up',
      'accounts'
    );
    const account = await accounts.findOne<AccountInfo>(
      { _id: accountId },
      {
        projection: {
          _id: 0,
          id: '$_id',
          displayName: '$attributes.displayName',
          accountType: '$attributes.accountType',
        },
      }
    );
    return account;
  } catch (err) {
    return {
      id: accountId,
      displayName: faker.finance.accountName(),
      accountType: faker.helpers.arrayElement([
        'TRANSACTIONAL',
        'SAVER',
      ]) as components['schemas']['AccountTypeEnum'],
    };
  }
};

export {
  getAccountBalance,
  getTransactionById,
  getTransactionsByCategory,
  getTransactionsByDate,
  getTransfers,
};
