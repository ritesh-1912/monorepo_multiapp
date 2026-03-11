/**
 * Drizzle Kit config for migrations. Run: npx drizzle-kit generate, npx drizzle-kit migrate.
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/invoice',
  },
});
