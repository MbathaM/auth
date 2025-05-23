import { db } from "@/db";
import { accounts } from "@/db/schema";
import { hashPassword, verifyResetSession, getResetSession } from "@/utils/passwords";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const resetPassword = new Hono();

resetPassword.post("/reset-password", async (c) => {
  try {
    const { email, newPassword } = await c.req.json();

    if (!email || !newPassword) {
      return c.json({ error: "Email and new password are required" }, { status: 400 });
    }

    // Get session ID from Redis using email
    const resetSessionId = await getResetSession(email);
    if (!resetSessionId) {
      return c.json({ error: "No active reset session found. Please request a new one." }, { status: 400 });
    }

    // Verify and consume session
    const verifiedEmail = await verifyResetSession(resetSessionId);
    if (!verifiedEmail || verifiedEmail !== email) {
      return c.json({ error: "Reset session is invalid or expired" }, { status: 400 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!user) {
      return c.json({ error: "User not found" }, { status: 404 });
    }

    // Find user's credentials account
    const account = await db.query.accounts.findFirst({
      where: (a, { eq, and }) => and(
        eq(a.userId, user.id),
        eq(a.type, "credentials")
      ),
    });

    if (!account) {
      return c.json({ error: "Account not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.update(accounts)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(accounts.id, account.id));

    return c.json({
      // data: {
      //   message: "Password reset successfully",
      // },
      message: "Password reset successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ error: "Failed to reset password" }, { status: 500 });
  }
});
