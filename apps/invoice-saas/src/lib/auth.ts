/**
 * NextAuth configuration. Credentials provider (email/password) and optional Google.
 * Session strategy: JWT. NEXTAUTH_SECRET and NEXTAUTH_URL must be set in production.
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
          image: user.image ?? undefined,
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
      if (token.id) return token;

      const email = (user?.email ?? token.email)?.toString()?.toLowerCase()?.trim();
      if (!email) return token;

      const db = getDb();
      const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email));

      if (existing) {
        token.id = existing.id;
        token.email = existing.email;
        return token;
      }

      if (user && account?.provider === 'google') {
        const [inserted] = await db
          .insert(schema.users)
          .values({
            email,
            name: user.name ?? null,
            image: user.image ?? null,
            hashedPassword: null,
          })
          .returning({ id: schema.users.id });
        if (inserted) token.id = inserted.id;
        token.email = email;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
