import {
  getAccountBalanceHistorical,
  getAccountById,
  getAccounts,
  getCategories,
  getCategoryInfo,
  getCategoryInfoHistory,
  getCumulativeIO,
  getIOStats,
  getMerchantInfo,
  getTagInfo,
  getTransactionById,
  getTransactionsByCategory,
  getTransactionsByDay,
} from '@/db';
import { filterTransactionFields } from '@/db/helpers';
import { AccountType } from '@/types/custom';
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  AccountInfoSchema,
  AccountMonthlyInfoSchema,
  BalanceHistorySchema,
  DateRangeSchema,
  Merchant,
  RetrievalOpts,
  TransactionCategoryInfoHistory,
  TransactionCategoryInfoHistorySchema,
  TransactionCategoryInfoSchema,
  TransactionCategoryTypeSchema,
  TransactionIdSchema,
  TransactionIO,
  TransactionResourceFilteredSchema,
} from '../schemas';
import { publicProcedure, router } from '../trpc';

export const publicRouter = router({
  getAccountBalance: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        accountId: z.string().uuid().optional(),
        accountType: z.custom<AccountType>().optional(),
      })
    )
    .output(z.array(BalanceHistorySchema.extend({ FormattedDate: z.string() })))
    .query(async ({ input }) => {
      const { dateRange, accountId, accountType } = input;
      const accountBalance = await getAccountBalanceHistorical(
        dateRange,
        accountId,
        accountType
      );
      return accountBalance.map(({ Timestamp, ...rest }) => {
        return {
          ...rest,
          Timestamp,
          FormattedDate: format(Timestamp, 'd LLL'),
        };
      });
    }),
  getAccountById: publicProcedure
    .input(
      z.object({
        accountId: z.string().uuid(),
      })
    )
    .output(AccountInfoSchema)
    .query(async ({ input }) => {
      const { accountId } = input;
      const account = await getAccountById(accountId);
      if (!account) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return account;
    }),
  getAccounts: publicProcedure
    .input(
      z.object({
        options: RetrievalOpts.optional(),
      })
    )
    .query(async ({ input }) => {
      const { options } = input;
      return await getAccounts(options);
    }),
  getCategories: publicProcedure
    .input(TransactionCategoryTypeSchema)
    .query(async ({ input }) => {
      return await getCategories(input);
    }),
  getCategoryInfo: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
        options: RetrievalOpts.optional(),
        parentCategory: z.string().optional(),
      })
    )
    .output(z.array(TransactionCategoryInfoSchema))
    .query(async ({ input }) => {
      const { dateRange, type, options, parentCategory } = input;
      return await getCategoryInfo(
        dateRange,
        type,
        options || {},
        parentCategory
      );
    }),
  getCategoryInfoHistory: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
        options: RetrievalOpts.optional(),
      })
    )
    .output(z.array(TransactionCategoryInfoHistorySchema))
    .query(async ({ input }) => {
      const { dateRange, type, options } = input;
      const results = await getCategoryInfoHistory(
        dateRange,
        type,
        options || {}
      );
      return results.map(({ day, month, year, categories }) => {
        const date =
          day && month
            ? format(new Date(year, month - 1, day), 'd LLL yy')
            : month
            ? format(new Date(year, month - 1), 'LLL yy')
            : format(new Date(year, 0, 1), 'yyyy');
        // @ts-expect-error
        const remappedElem: TransactionCategoryInfoHistory = {
          FormattedDate: date,
        };
        categories.map(
          ({ amount, categoryName }) => (remappedElem[categoryName] = amount)
        );
        return remappedElem;
      });
    }),
  getCumulativeIO: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        compareDateRange: DateRangeSchema.optional(),
        accountId: z.string().optional(),
        type: TransactionIO,
      })
    )
    .query(async ({ input }) => {
      const { dateRange, compareDateRange, accountId, type } = input;
      const results = await getCumulativeIO(type, dateRange, accountId);
      if (compareDateRange) {
        const compareResults = await getCumulativeIO(
          type,
          compareDateRange,
          accountId
        );
        return compareResults.map(
          ({ Timestamp, AmountCumulative, ...rest }, index) => {
            const FormattedDate = format(Timestamp, 'd MMM');
            return {
              ...rest,
              Timestamp,
              'Last year': AmountCumulative,
              'This year': results[index]?.AmountCumulative ?? null,
              FormattedDate,
            };
          }
        );
      } else {
        return results.map(({ Timestamp, ...rest }) => {
          const FormattedDate = format(Timestamp, 'd MMM');
          return { ...rest, Timestamp, FormattedDate };
        });
      }
    }),
  getMerchantInfo: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        options: RetrievalOpts.optional(),
        type: TransactionIO.optional(),
      })
    )
    .output(z.array(Merchant))
    .query(async ({ input }) => {
      const { dateRange, options, type } = input;
      return await getMerchantInfo(options || {}, dateRange, type);
    }),
  getIOStats: publicProcedure
    .input(
      z.object({
        accountId: z.string().uuid().optional(),
        dateRange: DateRangeSchema,
        options: RetrievalOpts.optional(),
      })
    )
    .output(z.array(AccountMonthlyInfoSchema))
    .query(async ({ input }) => {
      const { accountId, dateRange, options } = input;
      const results = await getIOStats(options, dateRange, accountId);
      return results.map(({ Year, Month, ...rest }) =>
        Year && Month
          ? {
              ...rest,
              Year,
              Month,
              FormattedDate: format(new Date(Year, Month - 1), 'LLL yy'),
            }
          : rest
      );
    }),
  getTagInfo: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await getTagInfo(input);
  }),
  getTransactionById: publicProcedure
    .input(TransactionIdSchema)
    .output(TransactionResourceFilteredSchema)
    .query(async ({ input }) => {
      const transaction = await getTransactionById(input);
      if (!transaction) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return (await filterTransactionFields([transaction]))[0];
    }),
  getTransactionsByDay: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema.optional(),
        options: RetrievalOpts.optional(),
      })
    )
    .query(async ({ input }) => {
      const { dateRange, options } = input;
      return await getTransactionsByDay(options, dateRange);
    }),
  getTransactionsByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        type: TransactionCategoryTypeSchema,
        dateRange: DateRangeSchema.optional(),
      })
    )
    .query(async ({ input }) => {
      const { category, type, dateRange } = input;
      return await getTransactionsByCategory(category, type);
    }),
});
