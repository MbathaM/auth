import { db } from "@/db";
import { accounts } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
export async function getAccountByUserId(userId, accountId) {
    const account = await db.query.accounts.findFirst({
        where: (a, { eq, and }) => and(eq(a.userId, userId)),
    });
    if (!account)
        throw new Error("Account not found");
    return account;
}
// Used to create a new account for a user (credentials or OAuth)
export async function createAccount(providerId, accountId, userId, type, password) {
    const [account] = await db.insert(accounts).values({
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
