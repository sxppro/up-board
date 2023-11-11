import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

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
};
