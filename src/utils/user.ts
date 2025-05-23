import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetches a user from the database by their unique ID.
 *
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<import("@/db/schema").users>} The user object.
 * @throws Will throw an error if no user is found with the provided ID.
 */
export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw new Error("User not found");

  return user;
}
