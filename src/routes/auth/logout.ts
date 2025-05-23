import { Hono } from "hono";
import { invalidateSession } from "@/utils/session";
import { verifyJWT } from "@/utils/jwt";

export const logout = new Hono();

logout.post("/logout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return c.json({ error: "Authorization token required" }, { status: 401 });
    }

    // Optionally verify the JWT before invalidating
    try {
      await verifyJWT(token);
    } catch {
      return c.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    await invalidateSession(token);
    return c.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ error: "Failed to logout" }, { status: 500 });
  }
});