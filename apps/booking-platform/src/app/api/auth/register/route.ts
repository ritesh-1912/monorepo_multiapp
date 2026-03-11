/**
 * Register a new user. First user becomes owner; rest are customer.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

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

  const db = getDb();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, email));
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const allUsers = await db.select().from(schema.users);
  const isFirstUser = allUsers.length === 0;
  const role = isFirstUser ? 'owner' : 'customer';

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      name: parsed.data.name,
      hashedPassword,
      role,
    })
    .returning({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
    });

  return NextResponse.json({ user }, { status: 201 });
}
