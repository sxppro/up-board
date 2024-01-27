import { getCategories, getCategoryInfo, getMonthlyInfo } from '@/db';
import { z } from 'zod';
import {
  AccountMonthlyInfoSchema,
  DateRangeSchema,
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
});
