import { db } from "@/db";
import { sessions } from "@/db/schema";
import { createJwt } from "@/utils/jwt";
import type { Context } from "hono";
import { v4 as uuidv4 } from "uuid";
import { getConnInfo } from "@hono/node-server/conninfo";
import { eq } from "drizzle-orm";
import { getUserById } from "@/utils/user";

/**
 * Creates a new session for a user or returns an existing valid session token.
 *
 * This function:
 * - Checks if the user already has a valid session and returns its token if found.
 * - Deletes any old or expired sessions for the user.
 * - Creates a new JWT token.
 * - Saves a new session record with connection info.
 *
 * @param {Context} c - The Hono context object.
 * @param {string} userId - The ID of the user to create a session for.
 * @returns {Promise<string>} The JWT token representing the session.
 */
export async function createSession(c: Context, userId: string): Promise<string> {
  // 1. Try to reuse valid existing session
  const existingSession = await db.query.sessions.findFirst({
    where: (s, { eq, gt, and }) =>
      and(eq(s.userId, userId), gt(s.expiresAt, new Date())),
  });

  if (existingSession) {
    return existingSession.token;
  }

  // 2. Remove old/expired sessions for user
  await db.delete(sessions).where(eq(sessions.userId, userId));

  // 3. Gather connection info
  const info = getConnInfo(c);
  const userAgent = c.req.header("User-Agent") || "Unknown";
  const ipAddress = info.remote.address || "1:";

  // 4. Fetch user details
  const user = await getUserById(userId);

  // 5. Create JWT
  const token = await createJwt({
    userId: user.id,
    role: user.role,
  });

  // 6. Save new session to DB
  await db.insert(sessions).values({
    id: uuidv4(),
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours expiration
    userAgent,
    ipAddress,
  });

  return token;
}

/**
 * Retrieves the current active session for a given user, if any.
 *
 * @param {Context} c - The Hono context object.
 * @param {string} userId - The ID of the user to retrieve the session for.
 * @returns {Promise<import("@/db/schema").sessions | null>} The active session object or null if none found.
 */
export async function getSession(c: Context, userId: string) {
  const session = await db.query.sessions.findFirst({
    where: (s, { eq, gt, and }) =>
      and(eq(s.userId, userId), gt(s.expiresAt, new Date())),
  });

  return session;
}

/**
 * Invalidates a user's session by removing it from the database.
 *
 * @param {string} token - The JWT token representing the session.
 * @returns {Promise<void>}
 */
export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}
