import { getCategories, getCategoryInfo, getMonthlyInfo } from '@/db';
import { z } from 'zod';
import {
  DateRange,
  TransactionCategoryInfo,
  TransactionCategoryType,
} from '../schemas';
import { authedProcedure, router } from '../trpc';

export const authedRouter = router({
  getCategories: authedProcedure
    .input(TransactionCategoryType)
    .query(async ({ input }) => {
      return await getCategories(input);
    }),
  getMonthlyInfo: authedProcedure.input(DateRange).query(async ({ input }) => {
    return await getMonthlyInfo(input);
  }),
  getCategoryInfo: authedProcedure
    .input(
      z.object({
        dateRange: DateRange,
        type: TransactionCategoryType,
      })
    )
    .output(z.array(TransactionCategoryInfo))
    .query(async ({ input }) => {
      return await getCategoryInfo(input.dateRange, input.type);
    }),
});
