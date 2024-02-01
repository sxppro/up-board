import { publicProcedure, router } from '../trpc';

export const publicRouter = router({
  getNumbers: publicProcedure.query(async () => 'Hello there! 🪄'),
});
