import { publicProcedure, router } from './trpc';

export const appRouter = router({
  getNumbers: publicProcedure.query(async () => [10, 20, 30]),
});

export type AppRouter = typeof appRouter;
