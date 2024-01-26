import { authedProcedure, publicProcedure, router } from '../trpc';

export const authedRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecret: authedProcedure.query(async () => {
    return 'test auth';
  }),
});
