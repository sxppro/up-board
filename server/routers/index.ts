import { router } from '../trpc';
import { authedRouter } from './authed';
import { publicRouter } from './public';

export const appRouter = router({
  public: publicRouter,
  user: authedRouter,
});

export type AppRouter = typeof appRouter;
