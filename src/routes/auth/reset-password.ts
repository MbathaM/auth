import { db } from "@/db";
import { accounts } from "@/db/schema";
import { verifyCode } from "@/utils/code";
import { hashPassword } from "@/utils/passwords";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const resetPassword = new Hono();

resetPassword.post("/reset-password", async (c) => {
  try {
    const { email, code, newPassword } = await c.req.json();

    if (!email || !code || !newPassword) {
      return c.json({ error: "Email, code, and new password are required" }, { status: 400 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!user) {
      return c.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the code
    const verification = await verifyCode(user, code, "password");

    if (!verification.success) {
      return c.json({ error: verification.error }, { status: 400 });
    }

    // Find the user's credentials account
    const account = await db.query.accounts.findFirst({
      where: (a, { eq, and }) => and(
        eq(a.userId, user.id),
        eq(a.type, "credentials")
      ),
    });

    if (!account) {
      return c.json({ error: "Account not found" }, { status: 404 });
    }

    // Hash the new password and update the account
    const hashedPassword = await hashPassword(newPassword);
    
    await db.update(accounts)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(accounts.id, account.id));

    return c.json({
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ error: "Failed to reset password" }, { status: 500 });
  }
});