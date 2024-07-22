import {
  getAccountBalance,
  getCategories,
  getCategoryInfo,
  getCategoryInfoHistory,
  getMonthlyInfo,
  getTagInfo,
  getTransactionById,
  replaceTransactions,
} from '@/db';
import { getTransactions } from '@/db/helpers';
import { filterTransactionFields } from '@/utils/helpers';
import { addTags, deleteTags, getTags } from '@/utils/up';
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  AccountBalanceHistorySchema,
  AccountMonthlyInfoSchema,
  DateRangeSchema,
  TransactionAccountTypeSchema,
  TransactionCategoryInfoHistory,
  TransactionCategoryInfoHistorySchema,
  TransactionCategoryInfoSchema,
  TransactionCategoryTypeSchema,
  TransactionIdSchema,
  TransactionResourceFilteredSchema,
  TransactionRetrievalOptionsSchema,
  TransactionTagsModificationSchema,
} from '../schemas';
import { authedProcedure, router } from '../trpc';

export const authedRouter = router({
  getCategories: authedProcedure
    .input(TransactionCategoryTypeSchema)
    .query(async ({ input }) => {
      return await getCategories(input);
    }),
  getTags: authedProcedure.query(async () =>
    (await getTags()).map(({ id }) => ({ name: id, value: id }))
  ),
  addTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await addTags(transactionId, tags);
      if (error) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const res = await replaceTransactions([transactionId]);
      if (!response.ok || res !== 1) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  deleteTags: authedProcedure
    .input(TransactionTagsModificationSchema)
    .mutation(async ({ input }) => {
      const { transactionId, tags } = input;
      const { error, response } = await deleteTags(transactionId, tags);
      if (error) {
        console.error(error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const res = await replaceTransactions([transactionId]);
      if (!response.ok || res !== 1) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
  getMonthlyInfo: authedProcedure
    .input(
      z.object({ accountId: z.string().uuid(), dateRange: DateRangeSchema })
    )
    .output(z.array(AccountMonthlyInfoSchema))
    .query(async ({ input }) => {
      const { accountId, dateRange } = input;
      return await getMonthlyInfo(accountId, dateRange);
    }),
  getCategoryInfo: authedProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
        parentCategory: z.string().optional(),
      })
    )
    .output(z.array(TransactionCategoryInfoSchema))
    .query(async ({ input }) => {
      const { dateRange, type, parentCategory } = input;
      return await getCategoryInfo(dateRange, type, parentCategory);
    }),
  getCategoryInfoHistory: authedProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
      })
    )
    .output(z.array(TransactionCategoryInfoHistorySchema))
    .query(async ({ input }) => {
      const { dateRange, type } = input;
      const results = await getCategoryInfoHistory(dateRange, type);
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
  getAccountBalance: authedProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        account: TransactionAccountTypeSchema,
      })
    )
    .output(
      z.array(AccountBalanceHistorySchema.extend({ FormattedDate: z.string() }))
    )
    .query(async ({ input }) => {
      const { dateRange, account } = input;
      const accountBalance = await getAccountBalance(dateRange, account);
      return accountBalance.map(({ Timestamp, ...rest }) => {
        return {
          ...rest,
          Timestamp,
          FormattedDate: format(Timestamp, 'dd LLL yy'),
        };
      });
    }),
  getTagInfo: authedProcedure.input(z.string()).query(async ({ input }) => {
    return await getTagInfo(input);
  }),
  getTransactionsByDate: authedProcedure
    .input(TransactionRetrievalOptionsSchema)
    .query(async ({ input }) => {
      return await getTransactions(input);
    }),
  getTransactionById: authedProcedure
    .input(TransactionIdSchema)
    .output(TransactionResourceFilteredSchema)
    .query(async ({ input }) => {
      const transaction = await getTransactionById(input);
      if (!transaction) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return filterTransactionFields([transaction])[0];
    }),
});
