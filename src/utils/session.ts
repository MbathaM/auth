import { db } from "@/db";
import { sessions } from "@/db/schema";
import { createJwt } from "@/utils/jwt";
import type { Context } from "hono";
import { v4 as uuidv4 } from "uuid";
import { getConnInfo } from "@hono/node-server/conninfo";
import { eq} from "drizzle-orm";
import { getUserById } from "@/utils/user";

// Create a new session or return an existing one
export async function createSession(c: Context, userId: string) {
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
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    userAgent,
    ipAddress,
  });

  return token;
}

// Get current active session (if any)
export async function getSession(c: Context, userId: string) {
  const session = await db.query.sessions.findFirst({
    where: (s, { eq, gt, and }) =>
      and(eq(s.userId, userId), gt(s.expiresAt, new Date())),
  });

  return session;
}
