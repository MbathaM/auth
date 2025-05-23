import { Hono } from "hono";
import { db } from "@/db";
import { users } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "@/utils/passwords";
import { createAccount } from "@/utils/accounts";
import { createVerificationCode } from "@/utils/code";
import { sendEmail } from "@/utils/email";

export const signup = new Hono();

signup.post("/signup", async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (existingUser) {
      return c.json({ error: "User already exists" }, { status: 400 });
    }

    // Create user
    const userId = uuidv4();
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        name,
        email,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Hash password and create account
    const hashedPassword = await hashPassword(password);
    await createAccount(uuidv4(), email, userId, "credentials", hashedPassword);

    // Generate verification code and send email
    const verificationCode = await createVerificationCode(user, "email");

    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Your verification code is: ${verificationCode}`,
    });

    return c.json({
      // data: {
      //   user: {
      //    ...user,
      //   },
      //   message: "Verification code sent to your email",
      // },
      message: "Verification code sent to your email",
      user: {
        ...user,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Failed to register user" }, { status: 500 });
  }
});
