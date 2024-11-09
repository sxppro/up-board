import accountsMock from '@/mock/accounts.json';
import categoriesMock from '@/mock/categories.json';
import tagsMock from '@/mock/tags.json';
import transactionsMock from '@/mock/transactions.json';
import { getMockData } from '@/scripts/generateMockData';
import {
  AccountMonthlyInfoSchema,
  CategoryInfo,
  CumulativeIO,
  Merchant,
  RetrievalOptions,
  TagInfoSchema,
  TransactionGroupByDay,
  TransactionIncomeInfo,
  TransactionIOEnum,
  type AccountBalanceHistory,
  type AccountInfo,
  type AccountMonthlyInfo,
  type DateRange,
  type TagInfo,
  type TransactionCategoryInfo,
  type TransactionCategoryInfoHistoryRaw,
  type TransactionCategoryOption,
  type TransactionCategoryType,
  type TransactionRetrievalOptions,
} from '@/server/schemas';
import {
  AccountResource,
  CategoryResource,
  DbTransactionResource,
} from '@/types/custom';
import { components } from '@/types/up-api';
import { auth } from '@/utils/auth';
import { outputTransactionFields } from '@/utils/helpers';
import { getTransactionById as getUpTransactionById } from '@/utils/up';
import { faker } from '@faker-js/faker';
import { UUID } from 'bson';
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from 'date-fns';
import { CollectionOptions, Document, MongoBulkWriteError } from 'mongodb';
import client from './connect';
import {
  filterByDateRange,
  findDistinctMerchants,
  findDistinctTags,
  groupBalanceByDay,
  groupByCategory,
  groupByCategoryAndDate,
  groupByDay,
  groupByMerchant,
  groupByTag,
  searchTransactions as searchTx,
  statsByAccount,
  statsByTag,
  sumIOByDay,
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
 * Map categories IDs to names
 * @param categoryType
 * @returns Map
 */
const mapCategories = async (categoryType: TransactionCategoryType) => {
  const categories = await getCategories(categoryType);
  const map = new Map<string, string>();
  categories.forEach(({ id, name }) => map.set(id, name));
  return map;
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
        searchTx(search)
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
        groupBalanceByDay(dateRange, accountId)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      if (dateRange.from < dateRange.to) {
        const startingBalance = parseFloat(
          faker.finance.amount({ max: 10000 })
        );
        const days = eachDayOfInterval({
          start: dateRange.from,
          end: dateRange.to,
        });
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

/**
 * Total or grouped transaction statistics between 2 dates
 * @param avg optionally average stats
 * @returns list of stats, single element if no groupBy provided
 */
export const getAccountStats = async (
  accountId: string,
  dateRange: DateRange,
  options?: RetrievalOptions,
  avg?: boolean
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<AccountMonthlyInfo>(
        statsByAccount(accountId, dateRange, options || {}, avg)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      if (options?.groupBy && dateRange.from < dateRange.to) {
        const dates =
          options.groupBy === 'yearly'
            ? eachYearOfInterval({ start: dateRange.from, end: dateRange.to })
            : options.groupBy === 'monthly'
            ? eachMonthOfInterval({ start: dateRange.from, end: dateRange.to })
            : eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

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
 * List of all merchants
 * @returns
 */
export const getMerchants = async (options: RetrievalOptions) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<Merchant>(
        findDistinctMerchants(options)
      );
      const merchants = await cursor.toArray();
      const categories = await mapCategories('child');
      const parentCategories = await mapCategories('parent');
      return merchants.map(({ category, parentCategory, ...rest }) => ({
        ...rest,
        category,
        parentCategory,
        categoryName: categories.get(category),
        parentCategoryName: parentCategories.get(parentCategory),
      }));
    } else {
      return [];
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
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const transactionAcc = await getAccounts('TRANSACTIONAL', {
      sort: {
        'attributes.balance.valueInBaseUnits': -1,
      },
      limit: 1,
    });
    if (transactions && transactionAcc[0]) {
      const cursor = transactions.aggregate<TransactionIncomeInfo>(
        groupByMerchant(dateRange, transactionAcc[0].id, options, type)
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
 * Category details by id
 * @param id
 * @returns
 */
export const getCategoryById = async (id: string) => {
  try {
    const categories = await connectToCollection<CategoryResource>(
      'up',
      'categories'
    );
    if (categories) {
      const category = await categories.findOne<CategoryInfo>(
        { _id: id },
        {
          projection: {
            _id: 0,
            id: '$_id',
            name: '$attributes.name',
            parentCategory: '$relationships.parent.data.id',
            parentCategoryName: '$relationships.parent.data.id',
          },
        }
      );
      if (category) {
        if (category.parentCategory) {
          category.parentCategoryName =
            (
              await categories.findOne<{ name: string }>(
                { _id: category.parentCategory },
                {
                  projection: {
                    _id: 0,
                    name: '$attributes.name',
                  },
                }
              )
            )?.name || null;
        }
        return category;
      }
      return null;
    } else {
      const category = categoriesMock.data.find(
        ({ id: categoryId }) => categoryId === id
      );
      if (category) {
        return {
          id: category.id,
          name: category.attributes.name,
          parentCategory: category.relationships.parent.data?.id,
          parentCategoryName: categoriesMock.data.find(
            ({ id }) => id === category.relationships.parent.data?.id
          )?.attributes.name,
        };
      }
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
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
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const transactionAcc = await getAccounts('TRANSACTIONAL', {
      sort: {
        'attributes.balance.valueInBaseUnits': -1,
      },
      limit: 1,
    });
    if (transactions && transactionAcc[0]) {
      const cursor = transactions.aggregate<TransactionCategoryInfo>(
        groupByCategory(
          dateRange,
          transactionAcc[0].id,
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
  type: TransactionCategoryType,
  options: RetrievalOptions
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const transactionAcc = await getAccounts('TRANSACTIONAL', {
      sort: {
        'attributes.balance.valueInBaseUnits': -1,
      },
      limit: 1,
    });
    if (transactions && transactionAcc[0]) {
      const cursor = transactions.aggregate<TransactionCategoryInfoHistoryRaw>(
        groupByCategoryAndDate(dateRange, transactionAcc[0].id, type, options)
      );
      const results = await cursor.toArray();
      return results;
    } else {
      if (dateRange.from < dateRange.to) {
        const months = eachMonthOfInterval({
          start: dateRange.from,
          end: dateRange.to,
        });
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
          day: date.getDate(),
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
        sumIOByDay(dateRange, accountId, type)
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
      const cursor = transactions.aggregate<TagInfo>(statsByTag(tag));
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
 * Group transactions by day
 * @param accountId
 * @param dateRange
 * @param options
 * @returns
 */
export const getTransactionsByDay = async (
  accountId: string,
  dateRange?: DateRange,
  options?: RetrievalOptions
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const cursor = transactions.aggregate<TransactionGroupByDay>(
        groupByDay(accountId, dateRange, options)
      );
      const results = (await cursor.toArray()).map(
        ({ transactions, ...rest }) => ({
          transactions: transactions.map((transaction) =>
            outputTransactionFields(transaction)
          ),
          ...rest,
        })
      );
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
        filterByDateRange(options, accountId)
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
export const getTransactionsByCategory = async (
  category: string,
  type: TransactionCategoryType,
  dateRange?: DateRange
) => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    const transactionAcc = await getAccounts('TRANSACTIONAL', {
      sort: {
        'attributes.balance.valueInBaseUnits': -1,
      },
      limit: 1,
    });
    if (transactions && transactionAcc[0]) {
      const cursor = transactions
        .find({
          ...(type === 'child'
            ? { 'relationships.category.data.id': category }
            : { 'relationships.parentCategory.data.id': category }),
          ...(dateRange && {
            'attributes.createdAt': {
              $gte: dateRange.from,
              $lte: dateRange.to,
            },
          }),
          'relationships.account.data.id': transactionAcc[0].id,
        })
        .sort({ 'attributes.createdAt': -1 });
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
 * List of all transaction types
 * @returns
 */
export const getTransactionTypes = async () => {
  try {
    const transactions = await connectToCollection<DbTransactionResource>(
      'up',
      'transactions'
    );
    if (transactions) {
      const txTypes = await transactions.distinct('attributes.transactionType');
      return txTypes;
    }
  } catch (err) {
    console.error(err);
    return [];
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
      const cursor = transactions.aggregate(groupByTag());
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
        findDistinctTags()
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

export { getTransactionById, getTransactionsByDate };
