import { authOptions } from '@/utils/auth';
import { getServerSession } from 'next-auth';

/**
 * TRPC context for retrieving next-auth session from request
 * @param param0
 * @returns
 */
export const createContext = async () => {
  const session = await getServerSession(authOptions);
  return { session };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
