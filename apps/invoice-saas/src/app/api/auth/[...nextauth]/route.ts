/**
 * NextAuth API route handler. Handles /api/auth/* (signin, signout, session, etc.).
 */
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Validate required env vars early to avoid cryptic "server configuration" errors
function validateAuthConfig() {
  const issues: string[] = [];
  if (!process.env.NEXTAUTH_SECRET) issues.push('NEXTAUTH_SECRET');
  if (!process.env.NEXTAUTH_URL) issues.push('NEXTAUTH_URL');
  if (!process.env.DATABASE_URL) issues.push('DATABASE_URL');
  if (process.env.VERCEL && process.env.NEXTAUTH_URL?.startsWith('http://localhost')) {
    issues.push('NEXTAUTH_URL must be your Vercel URL (e.g. https://your-app.vercel.app), not localhost');
  }
  if (process.env.VERCEL && process.env.DATABASE_URL?.includes('localhost')) {
    issues.push('DATABASE_URL cannot use localhost on Vercel — use Neon, Supabase, or another hosted Postgres');
  }
  if (!process.env.AUTH_TRUST_HOST && process.env.VERCEL) {
    issues.push('AUTH_TRUST_HOST=true');
  }
  if (issues.length > 0) {
    throw new Error(`Auth config: set in Vercel → Settings → Environment Variables: ${issues.join('; ')}`);
  }
}
validateAuthConfig();

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
