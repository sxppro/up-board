import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers';
import { CachePresets } from '@/utils/constants';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    responseMeta(opts) {
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
        return {
          headers: new Headers({
            'cache-control': `public, s-maxage=${CachePresets.ONE_DAY_IN_SECONDS}`,
          }),
        };
      }
      return {};
    },
  });

export { handler as GET, handler as POST };
