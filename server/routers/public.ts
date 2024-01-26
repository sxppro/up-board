import { publicProcedure, router } from '../trpc';

export const publicRouter = router({
  getNumbers: publicProcedure.query(async () => [10, 20, 30]),
});
