/**
 * NextAuth middleware to protect authenticated routes.
 * Protects all /dashboard/* routes.
 */
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*'],
};
