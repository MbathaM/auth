import { db } from "@/db";
import { sendEmail } from "@/utils/email";
import { createVerificationCode } from "@/utils/code";
import { Hono } from "hono";
export const forgotPassword = new Hono();
forgotPassword.post("/forgot-password", async (c) => {
    try {
        const { email } = await c.req.json();
        if (!email) {
            return c.json({ error: "Email is required" }, { status: 400 });
        }
        // Find user by email
        const user = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.email, email),
        });
        if (!user) {
            // Don't reveal that the user doesn't exist for security reasons
            return c.json({
                data: {
                    message: "If a user with that email exists, a password reset code has been sent",
                },
            });
        }
        // Generate verification code and send email
        const verificationCode = await createVerificationCode(user, "password");
        await sendEmail({
            to: email,
            subject: "Reset your password",
            text: `Your password reset code is: ${verificationCode}`,
        });
        return c.json({
            data: {
                message: "If a user with that email exists, a password reset code has been sent",
            },
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return c.json({ error: "Failed to process request" }, { status: 500 });
    }
});
