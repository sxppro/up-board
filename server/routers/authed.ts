import {
  getAccountBalance,
  getCategories,
  getCategoryInfo,
  getMonthlyInfo,
  getTransactionById,
} from '@/db';
import { filterTransactionFields } from '@/utils/helpers';
import { getTags } from '@/utils/up';
import { TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { z } from 'zod';
import {
  AccountBalanceHistorySchema,
  AccountMonthlyInfoSchema,
  DateRangeSchema,
  TransactionAccountTypeSchema,
  TransactionCategoryInfoSchema,
  TransactionCategoryTypeSchema,
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
  getMonthlyInfo: authedProcedure
    .input(DateRangeSchema)
    .output(z.array(AccountMonthlyInfoSchema))
    .query(async ({ input }) => {
      return await getMonthlyInfo(input);
    }),
  getCategoryInfo: authedProcedure
    .input(
      z.object({
        dateRange: DateRangeSchema,
        type: TransactionCategoryTypeSchema,
      })
    )
    .output(z.array(TransactionCategoryInfoSchema))
    .query(async ({ input }) => {
      return await getCategoryInfo(input.dateRange, input.type);
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
      const accountBalance = await getAccountBalance(
        input.dateRange,
        input.account
      );
      return accountBalance.map(({ Timestamp, ...rest }) => {
        return {
          ...rest,
          Timestamp,
          FormattedDate: format(Timestamp, 'dd LLL yy'),
        };
      });
    }),
  getTransactionById: authedProcedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      const transaction = await getTransactionById(input);
      if (!transaction) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      return filterTransactionFields([transaction])[0];
    }),
});
