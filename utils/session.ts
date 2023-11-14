import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Gets logged-in user info
 * @returns user info or undefined
 */

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
