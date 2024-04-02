import { withAuth } from 'next-auth/middleware';

export default withAuth;

export const config = {
  matcher: ['/((?!api|login|a|e|_next/static|_next/image|favicon.ico).*)'],
};
