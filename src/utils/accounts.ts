import { db } from "@/db";
import { accounts } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

/**
 * Retrieves an account for a given user by their user ID.
 *
 * @param {string} userId - The ID of the user who owns the account.
 * @param {string} accountId - The ID of the account to retrieve (currently not used in query).
 * @returns {Promise<import('@/db/schema').accounts>} The found account object.
 * @throws {Error} Throws if no account is found for the given user.
 *
 * @example
 * const account = await getAccountByUserId("user-123", "account-456");
 */
export async function getAccountByUserId(userId: string, accountId: string) {
  const account = await db.query.accounts.findFirst({
    where: (a, { eq, and }) =>
      and(
        eq(a.userId, userId),
        // You might want to add eq(a.accountId, accountId) if intended
      ),
  });

  if (!account) throw new Error("Account not found");

  return account;
}

/**
 * Creates a new account record linked to a user, either via OAuth or credentials.
 *
 * @param {string} providerId - The OAuth provider ID or credential provider identifier.
 * @param {string} accountId - The unique identifier for the account (e.g., OAuth sub or username).
 * @param {string} userId - The ID of the user to associate this account with.
 * @param {"oauth" | "credentials"} type - The type of account: OAuth or credentials.
 * @param {string} [password] - Optional hashed password for credential accounts.
 * @returns {Promise<import('@/db/schema').accounts>} The newly created account record.
 *
 * @example
 * const newAccount = await createAccount(
 *   "google",
 *   "google-oauth-123",
 *   "user-123",
 *   "oauth"
 * );
 */
export async function createAccount(
  providerId: string,
  accountId: string,
  userId: string,
  type: "oauth" | "credentials",
  password?: string
) {
  const [account] = await db
    .insert(accounts)
    .values({
      id: uuidv4(),
      providerId,
      accountId,
      userId,
      type,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return account;
}
