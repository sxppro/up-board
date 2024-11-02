import {
  getAccountBalanceHistorical,
  getAccountById,
  getAccountStats,
  getCategories,
  getCategoryInfo,
  getCategoryInfoHistory,
  getCumulativeIO,
  getMerchantInfo,
  getTagInfo,
  getTransactionById,
} from '@/db';
import { filterTransactionFields, getTransactions } from '@/db/helpers';
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  AccountBalanceHistorySchema,
  AccountInfoSchema,
  AccountMonthlyInfoSchema,
  CumulativeIOSchema,
  DateRangeGroupBySchema,
  DateRangeSchema,
  RetrievalOpts,
  TransactionCategoryInfoHistory,
  TransactionCategoryInfoHistorySchema,
  TransactionCategoryInfoSchema,
  TransactionCategoryTypeSchema,
  TransactionIdSchema,
  TransactionIncomeInfoSchema,
  TransactionIO,
  TransactionResourceFilteredSchema,
  TransactionRetrievalOptionsSchema,
} from '../schemas';
import { publicProcedure, router } from '../trpc';

export const publicRouter = router({
  getAccountBalance: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        accountId: z.string().uuid(),
      })
    )
    .output(
      z.array(AccountBalanceHistorySchema.extend({ FormattedDate: z.string() }))
    )
    .query(async ({ input }) => {
      const { dateRange, accountId } = input;
      const accountBalance = await getAccountBalanceHistorical(
        dateRange,
        accountId
      );
      return accountBalance.map(({ Timestamp, ...rest }) => {
        return {
          ...rest,
          Timestamp,
          FormattedDate: format(Timestamp, 'dd LLL'),
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
      return results.map(({ month, year, categories }) => {
        // @ts-expect-error
        const remappedElem: TransactionCategoryInfoHistory = {
          FormattedDate: format(new Date(year, month - 1), 'LLL yy'),
        };
        categories.map(
          ({ amount, category }) => (remappedElem[category] = amount)
        );
        return remappedElem;
      });
    }),
  getCumulativeIO: publicProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        compareDateRange: DateRangeSchema.optional(),
        accountId: z.string(),
        type: TransactionIO,
      })
    )
    .output(
      z.array(
        CumulativeIOSchema.extend({
          FormattedDate: z.string(),
          AmountCumulativePast: z.number().optional(),
        })
      )
    )
    .query(async ({ input }) => {
      const { dateRange, compareDateRange, accountId, type } = input;
      const results = await getCumulativeIO(accountId, dateRange, type);
      if (compareDateRange) {
        const compareResults = await getCumulativeIO(
          accountId,
          compareDateRange,
          type
        );
        return compareResults.map(
          ({ Timestamp, AmountCumulative, ...rest }, index) => {
            const FormattedDate = format(Timestamp, 'd MMM');
            return {
              ...rest,
              Timestamp,
              AmountCumulativePast: AmountCumulative,
              AmountCumulative: results[index]?.AmountCumulative ?? null,
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
    .output(z.array(TransactionIncomeInfoSchema))
    .query(async ({ input }) => {
      const { dateRange, options, type } = input;
      return await getMerchantInfo(dateRange, options || {}, type);
    }),
  getMonthlyInfo: publicProcedure
    .input(
      z.object({
        accountId: z.string().uuid(),
        dateRange: DateRangeSchema,
        groupBy: DateRangeGroupBySchema.optional(),
      })
    )
    .output(z.array(AccountMonthlyInfoSchema))
    .query(async ({ input }) => {
      const { accountId, dateRange, groupBy } = input;
      const results = await getAccountStats(accountId, dateRange, groupBy);
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
  getTransactionsByDate: publicProcedure
    .input(TransactionRetrievalOptionsSchema)
    .query(async ({ input }) => {
      return await getTransactions(input);
    }),
});
