import { Hono } from "hono";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyCode } from "@/utils/code";
import { createResetSession } from "@/utils/passwords";
import { eq } from "drizzle-orm";

export const verify = new Hono();

verify.post("/verify", async (c) => {
  try {
    const { email, code, type } = await c.req.json();

    if (!email || !code || !type) {
      return c.json({ error: "Email, code, and type are required" }, { status: 400 });
    }

    if (type !== "email" && type !== "password") {
      return c.json({ error: "Type must be 'email' or 'password'" }, { status: 400 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!user) {
      return c.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the code
    const verification = await verifyCode(user, code, type);

    if (!verification.success) {
      return c.json({ error: verification.error }, { status: 400 });
    }

    // If verifying email, update user
    if (type === "email") {
      await db.update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      return c.json({
        // data: {
        //   message: "Email verified successfully. Procced to login.",
        // },
        message: "Email verified successfully. Procced to login.",
      }, { status: 200 });
    }

    // If verifying password, create reset session in Redis
    // const resetSessionId = await createResetSession(email);
    await createResetSession(email);

    return c.json({
      // data: {
      //   message: "Code verified. Proceed to reset password.",
      //   // resetSessionId,
      // },
      message: "Code verified. Proceed to reset password.",
    },{ status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return c.json({ error: "Failed to verify code" }, { status: 500 });
  }
});
