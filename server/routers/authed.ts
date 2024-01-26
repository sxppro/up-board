import { getCategories, getMonthlyStats } from '@/db';
import { DateRange, TransactionCategoryType } from '../schemas';
import { authedProcedure, router } from '../trpc';

export const authedRouter = router({
  getCategories: authedProcedure
    .input(TransactionCategoryType)
    .query(async ({ input }) => {
      return await getCategories(input);
    }),
  getMonthlyStats: authedProcedure.input(DateRange).query(async ({ input }) => {
    return await getMonthlyStats(input);
  }),
});
