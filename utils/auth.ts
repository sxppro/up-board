import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { headers } from 'next/headers';

if (
  !process.env.GOOGLE_ID ||
  !process.env.GOOGLE_SECRET ||
  !process.env.WHITELIST
) {
  throw new Error('Google OAuth env vars not defined');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // @ts-expect-error
    async signIn({ account, profile }) {
      if (account && profile && account.provider === 'google') {
        return profile.email && profile.email === process.env.WHITELIST;
      }
      return '';
    },
  },
  pages: {
    signIn: '/login',
    error: '/e',
  },
};

/**
 * Gets logged-in user info
 * @returns user info or undefined
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Server-side helper for authenticating user
 * sessions and email cron jobs
 * @param args
 * @returns
 */
export async function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return {
    session: await getServerSession(...args, authOptions),
    isCron:
      headers().get('authorization') === `Bearer ${process.env.CRON_SECRET}`,
  };
}
