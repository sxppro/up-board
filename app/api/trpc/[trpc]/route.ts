import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    responseMeta(opts) {
      const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
      const { ctx, errors, type } = opts;
      const allOk = errors.length === 0;
      const isQuery = type === 'query';

      if (ctx?.session) {
        return {
          headers: new Headers({
            'cache-control': 'private',
          }),
        };
      } else if (allOk && isQuery) {
        {
          return {
            headers: new Headers({
              'cache-control': `public, s-maxage=${ONE_DAY_IN_SECONDS}`,
            }),
          };
        }
      }
      return {};
    },
  });

export { handler as GET, handler as POST };
