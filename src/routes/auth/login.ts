import { db } from "@/db";
import { comparePassword } from "@/utils/passwords";
import { createSession } from "@/utils/session";
import { Hono } from "hono";

export const login = new Hono();

login.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (!user) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Find account with credentials
    const account = await db.query.accounts.findFirst({
      where: (a, { eq, and }) => and(
        eq(a.userId, user.id),
        eq(a.type, "credentials")
      ),
    });

    if (!account || !account.password) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, account.password);
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create session and return JWT
    const jwt = await createSession(c, user.id);
      return c.json({ token: jwt });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Failed to login" }, { status: 500 });
  }
});