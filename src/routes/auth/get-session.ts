import { verifyJWT } from "@/utils/jwt";
import { Hono } from "hono";
import { getSession } from "@/utils/session";
import { getUserById } from "@/utils/user";
import type { User, Session } from "@/types";

export const session = new Hono();

session.post("/get-session", async (c) => {
  let session: Session | null = null;
  let user: User | null = null;

  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (token) {
    const payload = await verifyJWT(token);
    if (payload && typeof payload.userId === "string") {
      user = await getUserById(payload.userId);
      if (user) {
        session = (await getSession(c, user.id)) ?? null;
      }
    }
  }

  return c.json(
    {
      data: { 
        session,
        user,
      },
    },
    { status: 200 }
  );
});
