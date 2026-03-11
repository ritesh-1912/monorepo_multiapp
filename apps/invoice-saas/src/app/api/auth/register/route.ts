/**
 * Registration endpoint.
 * Creates a new user with hashed password in the users table.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/lib/db';

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const db = getDb();
  const normalisedEmail = email.toLowerCase().trim();

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalisedEmail));

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(schema.users)
    .values({
      email: normalisedEmail,
      name,
      hashedPassword,
    })
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
    });

  return NextResponse.json(
    {
      user,
    },
    { status: 201 }
  );
}
