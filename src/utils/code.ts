import { db } from "@/db";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { verifications } from "@/db/schema";
import type { User } from "@/types";

function generateCode(length = 6): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

// Create and store a verification code
export async function createVerificationCode(user: User, type: "password" | "email" = "email"): Promise<string> {
    const code = generateCode();

    // Delete existing codes of this type
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

// Check if the code is valid and optionally clean it up
export async function verifyCode(user: User, code: string, type: "password" | "email"): Promise<{ success: boolean; error?: string }> {
    const verification = await db.query.verifications.findFirst({
        where: (v, { eq, and }) => and(
            eq(v.userId, user.id),
            eq(v.code, code),
            eq(v.type, type)
        ),
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
