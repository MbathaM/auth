import { redis } from "@/lib/redis";
import { compare, hash, genSalt } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

/**
 * Hashes a plain-text password using bcrypt.
 * @param password - The plain-text password to hash.
 * @returns A hashed version of the password.
 * @throws Error if hashing fails.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
}

/**
 * Compares a plain-text password with a hashed password.
 * @param password - The plain-text password provided by the user.
 * @param hashedPassword - The hashed password stored in the database.
 * @returns True if the passwords match, false otherwise.
 * @throws Error if comparison fails.
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
}

/**
 * Creates a temporary password reset session and stores it in Redis.
 * The session maps a unique ID to the user's email and expires after 10 minutes.
 * Also stores a reverse lookup from email to session ID for quick retrieval.
 *
 * @param email - The email address of the user requesting a password reset.
 * @returns A unique session ID to be used internally for verification.
 * @example
 * const sessionId = await createResetSession("user@example.com");
 */
export async function createResetSession(email: string): Promise<string> {
  const resetSessionId = uuidv4();
  const key = `reset:${resetSessionId}`;
  const emailKey = `reset_email:${email}`;

  await redis.set(key, email, {
    EX: 600, // 10 minutes
  });

  await redis.set(emailKey, resetSessionId, {
    EX: 600, // 10 minutes
  });

  return resetSessionId;
}

/**
 * Retrieves the reset session ID associated with a given email.
 * Returns null if no active session exists or if it has expired.
 *
 * @param email - The email address to look up the reset session for.
 * @returns The reset session ID or null if none exists.
 * @example
 * const sessionId = await getResetSession("user@example.com");
 */
export async function getResetSession(email: string): Promise<string | null> {
  const emailKey = `reset_email:${email}`;
  const resetSessionId = await redis.get(emailKey);
  return resetSessionId;
}

/**
 * Verifies the provided reset session ID and retrieves the associated email.
 * If valid, deletes the session and the reverse lookup to prevent reuse.
 *
 * @param resetSessionId - The unique reset session ID received from the user.
 * @returns The associated email address if valid, or null if expired/invalid.
 * @example
 * const email = await verifyResetSession(sessionId);
 * if (email) {
 *   // Proceed to allow password reset
 * }
 */
export async function verifyResetSession(resetSessionId: string): Promise<string | null> {
  const key = `reset:${resetSessionId}`;
  const email = await redis.get(key);

  if (!email) return null;

  const emailKey = `reset_email:${email}`;

  // Delete both keys to invalidate the reset session
  await redis.del(key);
  await redis.del(emailKey);

  return email;
}
