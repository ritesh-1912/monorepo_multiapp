/**
 * NextAuth config for Analytics Dashboard. Credentials provider; session includes role (admin | viewer).
 */
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const db = getDb();
        const email = credentials.email.toLowerCase().trim();
        const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
        if (!user || !user.hashedPassword) return null;
        const ok = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as { role?: string }).role;
        return token;
      }

      // For Google sign-in, find or create a user in DB on first login
      if (account?.provider === 'google' && token.email) {
        const db = getDb();
        const email = (token.email as string).toLowerCase().trim();
        const [existing] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email));
        if (existing) {
          token.id = existing.id;
          token.role = existing.role;
          return token;
        }

        const all = await db.select().from(schema.users);
        const role = all.length === 0 ? 'admin' : 'viewer';

        const [inserted] = await db
          .insert(schema.users)
          .values({
            email,
            name: null,
            hashedPassword: null,
            role,
          })
          .returning({ id: schema.users.id, role: schema.users.role });

        token.id = inserted.id;
        token.role = inserted.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
