import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db/client';
import { sessions, users } from '../db/schema';

export const SESSION_COOKIE_NAME = 'sg_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<AuthenticatedUser | null> {
  const now = new Date();

  const result = await db
    .select({
      user: {
        id: users.id,
        email: users.email,
        role: users.role,
      },
      session: {
        id: sessions.id,
        expiresAt: sessions.expiresAt,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
    .limit(1);

  const first = result[0];
  if (!first) {
    return null;
  }

  return first.user;
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

/**
 * Retrieves the currently logged-in admin user from cookies.
 */
export async function getCurrentAdmin(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return validateSession(sessionCookie.value);
}

/**
 * Throws an authentication error or returns the authenticated admin user.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await getCurrentAdmin();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
