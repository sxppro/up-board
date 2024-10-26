import accountsMock from '@/mock/accounts.json';
import categoriesMock from '@/mock/categories.json';
import tagsMock from '@/mock/tags.json';
import transactionsMock from '@/mock/transactions.json';
import { getMockData } from '@/scripts/generateMockData';
import {
  AccountMonthlyInfoSchema,
  CumulativeIO,
  RetrievalOptions,
  TagInfoSchema,
  TransactionIncomeInfo,
  TransactionIOEnum,
  type AccountBalanceHistory,
  type AccountInfo,
  type AccountMonthlyInfo,
  type DateRange,
  type DateRangeGroupBy,
  type TagInfo,
  type TransactionCategoryInfo,
  type TransactionCategoryInfoHistoryRaw,
  type TransactionCategoryOption,
  type TransactionCategoryType,
  type TransactionRetrievalOptions,
} from '@/server/schemas';
import { AccountResource, DbTransactionResource } from '@/types/custom';
import { components } from '@/types/up-api';
import { auth } from '@/utils/auth';
import { outputTransactionFields } from '@/utils/helpers';
import { getTransactionById as getUpTransactionById } from '@/utils/up';
import { faker } from '@faker-js/faker';
import { UUID } from 'bson';
import { addDays, addMonths, addYears } from 'date-fns';
import { CollectionOptions, Document, MongoBulkWriteError } from 'mongodb';
import client from './connect';
import {
  accountBalancePipeline,
  accountStatsPipeline,
  categoriesByPeriodPipeline,
  categoriesPipeline,
  cumulativeIOPipeline,
  merchantsPipeline,
  searchTransactionsPipeline,
  tagInfoPipeline,
  transactionsByDatePipeline,
  transactionsByTagsPipeline,
  uniqueTagsPipeline,
} from './pipelines';

faker.seed(17);

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
  if (session) {
    const database = client.db(db);
    return database.collection<T>(collection, collectionOpts);
  } else {
    return null;
  }
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
    const db = client.db('up');
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
    if (transactions) {
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
    }
  } catch (err) {
    console.error(err);
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
    if (transactions) {
      const cursor = transactions.aggregate<DbTransactionResource>(
        searchTransactionsPipeline(search)
      );
      const results = (await cursor.toArray()).map((transaction) =>
        outputTransactionFields(transaction)
      );
      return results;
    } else {
      return transactionsMock.data.filter(({ attributes }) =>
        attributes.description.toLowerCase().includes(search.toLowerCase())
      ) as unknown as ReturnType<typeof outputTransactionFields>[];
    }
  } catch (err) {
    console.error(err);
    return [];
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
    if (transactions) {
      const cursor = transactions.aggregate<AccountMonthlyInfo>(
        accountStatsPipeline(accountId, dateRange, groupBy)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      if (groupBy && dateRange.from < dateRange.to) {
        let date = new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate()
        );
        const dates = [];
        while (date < dateRange.to) {
          dates.push(date);
          date =
            groupBy === 'monthly'
              ? addMonths(date, 1)
              : groupBy === 'yearly'
              ? addYears(date, 1)
              : addDays(date, 1);
        }

        return dates.map((date) => {
          const income = parseFloat(faker.finance.amount({ max: 5000 }));
          const expenses = parseFloat(faker.finance.amount({ max: 5000 }));
          return {
            Income: income,
            Expenses: expenses,
            Net: income - expenses,
            Transactions: faker.number.int({ max: 100 }),
            Month: date.getMonth() + 1,
            Year: date.getFullYear(),
          };
        });
      }
      const income = parseFloat(faker.finance.amount({ max: 5000 }));
      const expenses = parseFloat(faker.finance.amount({ max: 5000 }));
      const data = [
        {
          Income: income,
          Expenses: expenses,
          Net: income - expenses,
          Transactions: faker.number.int({ max: 100 }),
        },
      ];
      const res = AccountMonthlyInfoSchema.array().safeParse(
        getMockData('getMonthlyInfo', data)
      );
      if (res.success) {
        return res.data;
      } else {
        console.error(res.error);
        return [];
      }
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Group income by merchant
 * @param dateRange
 * @returns
 */
export const getMerchantInfo = async (
  dateRange: DateRange,
  options: RetrievalOptions,
  type?: TransactionIOEnum
) => {
  try {
    if (!process.env.UP_TRANS_ACC) {
      throw new Error('Up transaction account not defined');
    }
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<TransactionIncomeInfo>(
        merchantsPipeline(dateRange, process.env.UP_TRANS_ACC, options, type)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
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
  options: RetrievalOptions,
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
    if (transactions) {
      const cursor = transactions.aggregate<TransactionCategoryInfo>(
        categoriesPipeline(
          dateRange,
          process.env.UP_TRANS_ACC,
          type,
          options || {},
          parentCategory
        )
      );
      const results = await cursor.toArray();
      return results;
    } else {
      const filteredCategories = categoriesMock.data.filter(
        ({ relationships }) =>
          parentCategory
            ? relationships.parent.data?.id === parentCategory
            : type === 'parent'
            ? relationships.parent.data === null
            : relationships.parent.data !== null
      );
      return faker.helpers
        .arrayElements(filteredCategories, { min: 3, max: 10 })
        .map(({ id, attributes }) => ({
          category: id,
          categoryName: attributes.name,
          amount: parseFloat(faker.finance.amount()),
          transactions: faker.number.int({ max: 100 }),
        }))
        .sort((a, b) => (a.amount < b.amount ? 1 : -1));
    }
  } catch (err) {
    console.error(err);
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
    if (transactions) {
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
    } else {
      if (dateRange.from < dateRange.to) {
        let date = new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth()
        );
        const months = [];
        while (date < dateRange.to) {
          months.push(date);
          date = addMonths(date, 1);
        }
        return months.map((date) => ({
          categories: categoriesMock.data
            .filter(({ relationships }) =>
              type === 'parent'
                ? relationships.parent.data === null
                : relationships.parent.data !== null
            )
            .map(({ attributes }) => ({
              category: attributes.name,
              amount: parseFloat(faker.finance.amount()),
              transactions: faker.number.int({ max: 100 }),
            })),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        }));
      }
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Cumulative income/expenses for an account
 * over time
 * @param accountId
 * @param dateRange
 * @param type
 * @returns
 */
export const getCumulativeIO = async (
  accountId: string,
  dateRange: DateRange,
  type: TransactionIOEnum
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<CumulativeIO>(
        cumulativeIOPipeline(dateRange, accountId, type)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Retrieves income and expense stats for a tag
 * @param tag
 * @returns
 */
export const getTagInfo = async (tag: string): Promise<TagInfo | undefined> => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<TagInfo>(tagInfoPipeline(tag));
      const results = await cursor.toArray();
      return results[0];
    } else {
      if (tagsMock.data.includes(tag)) {
        const data = {
          Income: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
          Expenses: faker.number.float({
            min: 0,
            max: 1000,
            fractionDigits: 2,
          }),
          Transactions: faker.number.int({ max: 100 }),
        };
        const res = TagInfoSchema.safeParse(getMockData('getTagInfo', data));
        if (res.success) {
          return res.data;
        } else {
          console.error(res.error);
        }
      }
      return;
    }
  } catch (err) {
    console.error(err);
    return;
  }
};

/**
 * Retrieves transactions between 2 dates
 * @param dateRange
 * @param options
 * @returns
 */
const getTransactionsByDate = async (
  options: TransactionRetrievalOptions,
  accountId?: string
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<DbTransactionResource>(
        transactionsByDatePipeline(options, accountId)
      );
      const results = (await cursor.toArray()).map((transaction) =>
        outputTransactionFields(transaction)
      );
      return results;
    } else {
      const { transactionType } = options;
      return transactionsMock.data
        .filter(({ attributes }) =>
          transactionType === 'transactions'
            ? attributes.isCategorizable
            : !attributes.isCategorizable
        )
        .map(({ relationships, ...rest }) => ({
          ...rest,
          relationships: {
            ...relationships,
            category: {
              data: {
                id:
                  categoriesMock.data.find(
                    ({ id }) => id === relationships.category.data.id
                  )?.attributes.name ?? 'Uncategorised',
              },
            },
            parentCategory: {
              data: {
                id:
                  categoriesMock.data.find(
                    ({ id }) => id === relationships.parentCategory.data.id
                  )?.attributes.name ?? 'Uncategorised',
              },
            },
          },
        }))
        .sort((a, b) =>
          new Date(a.attributes.createdAt) > new Date(b.attributes.createdAt)
            ? -1
            : 1
        )
        .slice(0, options.limit) as unknown as ReturnType<
        typeof outputTransactionFields
      >[];
    }
  } catch (err) {
    console.error(err);
    return [];
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
    if (transactions) {
      const cursor = transactions.find({ $text: { $search: category } });
      const results = (await cursor.toArray()).map((transaction) =>
        outputTransactionFields(transaction)
      );
      return results;
    } else {
      return transactionsMock.data
        .filter(
          ({ relationships }) => relationships.category.data.id === category
        )
        .map(({ relationships, ...rest }) => ({
          ...rest,
          relationships: {
            ...relationships,
            category: {
              data: {
                id: categoriesMock.data.find(
                  ({ id }) => id === relationships.category.data.id
                )?.attributes.name,
              },
            },
            parentCategory: {
              data: {
                id: categoriesMock.data.find(
                  ({ id }) => id === relationships.parentCategory.data.id
                )?.attributes.name,
              },
            },
          },
        })) as unknown as ReturnType<typeof outputTransactionFields>[];
    }
  } catch (err) {
    console.error(err);
    return [];
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
    if (transactions) {
      const result = await transactions.findOne({
        _id: new UUID(id).toBinary(),
      });
      return result ? outputTransactionFields(result) : result;
    } else {
      return (
        (transactionsMock.data.find(
          ({ id: txId }) => txId === id
        ) as unknown as ReturnType<typeof outputTransactionFields>) || null
      );
    }
  } catch (err) {
    console.error(err);
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
    if (transactions) {
      const cursor = transactions.find({ 'relationships.tags.data.id': tag });
      const results = (await cursor.toArray()).map((transaction) =>
        outputTransactionFields(transaction)
      );
      return results;
    } else {
      return transactionsMock.data
        .filter(({ relationships }) =>
          relationships.tags.data.find(({ id }) => id === tag)
        )
        .sort((a, b) =>
          new Date(a.attributes.createdAt) > new Date(b.attributes.createdAt)
            ? -1
            : 1
        ) as unknown as ReturnType<typeof outputTransactionFields>[];
    }
  } catch (err) {
    console.error(err);
    return [];
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
    if (transactions) {
      const cursor = transactions.aggregate(transactionsByTagsPipeline());
      const results = await cursor.toArray();
      return results;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
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
    if (categories) {
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
    } else {
      return categoriesMock.data
        .filter(({ relationships }) =>
          type === 'parent'
            ? relationships.parent.data === null
            : relationships.parent.data !== null
        )
        .map(({ id, attributes }) => ({
          id,
          value: attributes.name,
          name: attributes.name,
        }))
        .sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1));
    }
  } catch (err) {
    console.error(err);
    return [];
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
    if (transactions) {
      const cursor = transactions.aggregate<{ tags: string[] }>(
        uniqueTagsPipeline()
      );
      const results = await cursor.toArray();
      return results[0];
    } else {
      return { tags: tagsMock.data };
    }
  } catch (err) {
    console.error(err);
    return { tags: [] };
  }
};

/**
 * Retrieves list of accounts
 * @param accountType transactional or saver
 * @returns
 */
export const getAccounts = async (
  accountType?: components['schemas']['AccountTypeEnum'],
  options?: RetrievalOptions
) => {
  try {
    const accounts = await connectToCollection<AccountResource>(
      'up',
      'accounts'
    );
    if (accounts) {
      const cursor = accounts.find(
        accountType ? { 'attributes.accountType': accountType } : {}
      );
      if (options) {
        const { sort, limit } = options;
        sort && cursor.sort(sort);
        limit && cursor.limit(limit);
      }
      const results = await cursor
        .project<AccountInfo>({
          _id: 0,
          id: '$_id',
          displayName: '$attributes.displayName',
          accountType: '$attributes.accountType',
          balance: {
            $divide: ['$attributes.balance.valueInBaseUnits', 100],
          },
        })
        .toArray();
      return results;
    } else {
      return accountType
        ? accountsMock.data
            .filter(({ attributes }) => attributes.accountType === accountType)
            .map(({ id, attributes }) => ({
              id,
              displayName: attributes.displayName,
              accountType: attributes.accountType,
              balance: parseFloat(attributes.balance.value),
            }))
        : accountsMock.data.map(({ id, attributes }) => ({
            id,
            displayName: attributes.displayName,
            accountType: attributes.accountType,
            balance: parseFloat(attributes.balance.value),
          }));
    }
  } catch (err) {
    console.error(err);
    return [];
  }
};

/**
 * Retrieves account balance between 2 dates
 * @param start
 * @param end
 * @param accountId
 * @returns
 */
export const getAccountBalanceHistorical = async (
  dateRange: DateRange,
  accountId: string
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<AccountBalanceHistory>(
        accountBalancePipeline(dateRange.from, dateRange.to, accountId)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      if (dateRange.from < dateRange.to) {
        const startingBalance = parseFloat(
          faker.finance.amount({ max: 10000 })
        );
        let date = new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate()
        );
        const days = [];
        while (date < dateRange.to) {
          days.push(date);
          date = addDays(date, 1);
        }
        return days.map((date) => ({
          Year: date.getFullYear(),
          Month: date.getMonth() + 1,
          Day: date.getDate(),
          Timestamp: date,
          Amount: parseFloat(faker.finance.amount({ min: -1000 })),
          Balance:
            startingBalance + parseFloat(faker.finance.amount({ min: -1000 })),
        }));
      }
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
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
    if (accounts) {
      const account = await accounts.findOne<AccountInfo>(
        { _id: accountId },
        {
          projection: {
            _id: 0,
            id: '$_id',
            displayName: '$attributes.displayName',
            balance: {
              $toDouble: '$attributes.balance.value',
            },
            accountType: '$attributes.accountType',
          },
        }
      );
      return account;
    } else {
      const account = accountsMock.data.find(({ id }) => id === accountId);
      return account
        ? {
            id: account.id,
            displayName: account.attributes.displayName,
            accountType: account.attributes.accountType,
            balance: parseFloat(account.attributes.balance.value),
          }
        : null;
    }
  } catch (err) {
    console.error(err);
    return;
  }
};

export { getTransactionById, getTransactionsByCategory, getTransactionsByDate };
