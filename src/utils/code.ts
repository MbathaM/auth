import { db } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { verifications } from "@/db/schema";
import type { User } from "@/types";

/**
 * Generates a numeric verification code of a given length.
 *
 * @param {number} [length=6] - The length of the code to generate.
 * @returns {string} The generated numeric code as a string.
 *
 * @example
 * const code = generateCode(6); // e.g. "483920"
 */
function generateCode(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

/**
 * Creates and stores a new verification code for a user.
 * Deletes any existing verification codes of the same user before creating a new one.
 *
 * @param {User} user - The user object for whom the code is created.
 * @param {"password" | "email"} [type="email"] - The type of verification (password reset or email verification).
 * @returns {Promise<string>} The generated verification code.
 *
 * @example
 * const code = await createVerificationCode(user, "password");
 */
export async function createVerificationCode(
  user: User,
  type: "password" | "email" = "email"
): Promise<string> {
  const code = generateCode();

  // Delete existing codes of this user
  await db.delete(verifications).where(eq(verifications.userId, user.id));

  await db.insert(verifications).values({
    id: uuidv4(),
    userId: user.id,
    code,
    type,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30), // expires in 30 mins
  });

  return code;
}

/**
 * Verifies if a given verification code for a user and type is valid and not expired.
 * If valid, the code is deleted after verification.
 *
 * @param {User} user - The user object to verify against.
 * @param {string} code - The verification code to validate.
 * @param {"password" | "email"} type - The type of verification to check.
 * @returns {Promise<{ success: boolean; error?: string }>} Result of verification with success status and optional error message.
 *
 * @example
 * const result = await verifyCode(user, "123456", "email");
 * if (result.success) {
 *   // Proceed with verified action
 * } else {
 *   console.error(result.error);
 * }
 */
export async function verifyCode(
  user: User,
  code: string,
  type: "password" | "email"
): Promise<{ success: boolean; error?: string }> {
  const verification = await db.query.verifications.findFirst({
    where: (v, { eq, and }) =>
      and(eq(v.userId, user.id), eq(v.code, code), eq(v.type, type)),
  });

  if (!verification) {
    return { success: false, error: "Invalid or expired code." };
  }

  if (new Date(verification.expiresAt) < new Date()) {
    await db.delete(verifications).where(eq(verifications.id, verification.id));
    return { success: false, error: "Code expired." };
  }

  // Code is valid — delete it after use
  await db.delete(verifications).where(eq(verifications.id, verification.id));

  return { success: true };
}
