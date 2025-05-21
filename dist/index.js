var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono as Hono10 } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";

// src/routes/auth/index.ts
import { Hono as Hono7 } from "hono";

// src/utils/jwt.ts
import { SignJWT, jwtVerify } from "jose";
var secret = new TextEncoder().encode(process.env.JWT_SECRET);
var createJwt = async (payload, expiresIn = "1h") => await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresIn).sign(secret);
var verifyJWT = async (token) => {
  const { payload } = await jwtVerify(token, secret);
  return payload;
};

// src/routes/auth/get-session.ts
import { Hono } from "hono";

// src/db/index.ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accounts: () => accounts,
  sessions: () => sessions,
  users: () => users,
  verifications: () => verifications
});
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  role: text("role").notNull().default("user"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(/* @__PURE__ */ new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(/* @__PURE__ */ new Date())
});
var verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type", { enum: ["email", "password"] }).notNull().default("email"),
  // "email" or "password"
  code: text("code").notNull(),
  // 6 digit code
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull().default(new Date(Date.now() + 1e3 * 60 * 60))
  // 1 hour
});
var sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(/* @__PURE__ */ new Date())
});
var accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["oauth", "credentials"] }).notNull().default("credentials"),
  // "credentials" or "oauth"
  password: text("password"),
  // Nullable for OAuth
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(/* @__PURE__ */ new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(/* @__PURE__ */ new Date())
});

// src/db/index.ts
var client = createClient({ url: process.env.DB_FILE_NAME });
var db = drizzle({ client, schema: schema_exports, logger: true });

// src/utils/session.ts
import { v4 as uuidv4 } from "uuid";
import { getConnInfo } from "@hono/node-server/conninfo";
import { eq as eq2 } from "drizzle-orm";

// src/utils/user.ts
import { eq } from "drizzle-orm";
async function getUserById(userId) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });
  if (!user) throw new Error("User not found");
  return user;
}

// src/utils/session.ts
async function createSession(c, userId) {
  const existingSession = await db.query.sessions.findFirst({
    where: (s, { eq: eq6, gt, and }) => and(eq6(s.userId, userId), gt(s.expiresAt, /* @__PURE__ */ new Date()))
  });
  if (existingSession) {
    return existingSession.token;
  }
  await db.delete(sessions).where(eq2(sessions.userId, userId));
  const info = getConnInfo(c);
  const userAgent = c.req.header("User-Agent") || "Unknown";
  const ipAddress = info.remote.address || "1:";
  const user = await getUserById(userId);
  const token = await createJwt({
    userId: user.id,
    role: user.role
  });
  await db.insert(sessions).values({
    id: uuidv4(),
    token,
    userId: user.id,
    expiresAt: new Date(Date.now() + 1e3 * 60 * 60 * 24),
    // 24 hours
    userAgent,
    ipAddress
  });
  return token;
}
async function getSession(c, userId) {
  const session2 = await db.query.sessions.findFirst({
    where: (s, { eq: eq6, gt, and }) => and(eq6(s.userId, userId), gt(s.expiresAt, /* @__PURE__ */ new Date()))
  });
  return session2;
}

// src/routes/auth/get-session.ts
var session = new Hono();
session.post("/get-session", async (c) => {
  let session2 = null;
  let user = null;
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload && typeof payload.userId === "string") {
      user = await getUserById(payload.userId);
      if (user) {
        session2 = await getSession(c, user.id) ?? null;
      }
    }
  }
  return c.json({
    data: {
      session: session2,
      user
    }
  });
});

// src/routes/auth/register.ts
import { Hono as Hono2 } from "hono";
import { v4 as uuidv44 } from "uuid";

// src/utils/passwords.ts
import { compare, hash, genSalt } from "bcryptjs";
async function hashPassword(password) {
  try {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
}
async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
}

// src/utils/accounts.ts
import { v4 as uuidv42 } from "uuid";
async function createAccount(providerId, accountId, userId, type, password) {
  const [account] = await db.insert(accounts).values({
    id: uuidv42(),
    providerId,
    accountId,
    userId,
    type,
    password,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).returning();
  return account;
}

// src/utils/code.ts
import { v4 as uuidv43 } from "uuid";
import { eq as eq3 } from "drizzle-orm";
function generateCode(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}
async function createVerificationCode(user, type = "email") {
  const code = generateCode();
  await db.delete(verifications).where(eq3(verifications.userId, user.id));
  await db.insert(verifications).values({
    id: uuidv43(),
    userId: user.id,
    code,
    type,
    expiresAt: new Date(Date.now() + 1e3 * 60 * 30)
    // expires in 30 mins
  });
  return code;
}
async function verifyCode(user, code, type) {
  const verification = await db.query.verifications.findFirst({
    where: (v, { eq: eq6, and }) => and(
      eq6(v.userId, user.id),
      eq6(v.code, code),
      eq6(v.type, type)
    )
  });
  if (!verification) {
    return { success: false, error: "Invalid or expired code." };
  }
  if (new Date(verification.expiresAt) < /* @__PURE__ */ new Date()) {
    await db.delete(verifications).where(eq3(verifications.id, verification.id));
    return { success: false, error: "Code expired." };
  }
  await db.delete(verifications).where(eq3(verifications.id, verification.id));
  return { success: true };
}

// src/utils/email.ts
import "dotenv/config";
import { Resend } from "resend";
var apiKey = process.env.RESEND_API_KEY;
var resend = new Resend(apiKey);
var sendEmail = async ({
  to,
  subject,
  text: text2,
  react
}) => {
  return await resend.emails.send({
    from: "Melusi Mbatha <me@mbathamelusi.co.za>",
    to,
    subject,
    text: text2,
    react
  });
};

// src/routes/auth/register.ts
var register = new Hono2();
register.post("/register", async (c) => {
  try {
    const { name, email, password } = await c.req.json();
    if (!email || !password) {
      return c.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq: eq6 }) => eq6(u.email, email)
    });
    if (existingUser) {
      return c.json({ error: "User already exists" }, { status: 400 });
    }
    const userId = uuidv44();
    const [user] = await db.insert(users).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    const hashedPassword = await hashPassword(password);
    await createAccount(uuidv44(), email, userId, "credentials", hashedPassword);
    const verificationCode = await createVerificationCode(user, "email");
    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Your verification code is: ${verificationCode}`
    });
    return c.json({
      data: {
        user: {
          ...user
        },
        message: "Verification code sent to your email"
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Failed to register user" }, { status: 500 });
  }
});

// src/routes/auth/login.ts
import { Hono as Hono3 } from "hono";
var login = new Hono3();
login.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, { status: 400 });
    }
    const user = await db.query.users.findFirst({
      where: (u, { eq: eq6 }) => eq6(u.email, email)
    });
    if (!user) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const account = await db.query.accounts.findFirst({
      where: (a, { eq: eq6, and }) => and(
        eq6(a.userId, user.id),
        eq6(a.type, "credentials")
      )
    });
    if (!account || !account.password) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const isPasswordValid = await comparePassword(password, account.password);
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = await createSession(c, user.id);
    return c.json({
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Failed to login" }, { status: 500 });
  }
});

// src/routes/auth/verify.ts
import { Hono as Hono4 } from "hono";
import { eq as eq4 } from "drizzle-orm";
var verify = new Hono4();
verify.post("/verify", async (c) => {
  try {
    const { email, code, type } = await c.req.json();
    if (!email || !code || !type) {
      return c.json({ error: "Email, code, and type are required" }, { status: 400 });
    }
    if (type !== "email" && type !== "password") {
      return c.json({ error: "Type must be 'email' or 'password'" }, { status: 400 });
    }
    const user = await db.query.users.findFirst({
      where: (u, { eq: eq6 }) => eq6(u.email, email)
    });
    if (!user) {
      return c.json({ error: "User not found" }, { status: 404 });
    }
    const verification = await verifyCode(user, code, type);
    if (!verification.success) {
      return c.json({ error: verification.error }, { status: 400 });
    }
    if (type === "email") {
      await db.update(users).set({ emailVerified: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(users.id, user.id));
      return c.json({
        data: {
          message: "Email verified successfully"
        }
      });
    }
    return c.json({
      data: {
        message: "Code verified successfully",
        userId: user.id
      }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return c.json({ error: "Failed to verify code" }, { status: 500 });
  }
});

// src/routes/auth/forgot-password.ts
import { Hono as Hono5 } from "hono";
var forgotPassword = new Hono5();
forgotPassword.post("/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await db.query.users.findFirst({
      where: (u, { eq: eq6 }) => eq6(u.email, email)
    });
    if (!user) {
      return c.json({
        data: {
          message: "If a user with that email exists, a password reset code has been sent"
        }
      });
    }
    const verificationCode = await createVerificationCode(user, "password");
    await sendEmail({
      to: email,
      subject: "Reset your password",
      text: `Your password reset code is: ${verificationCode}`
    });
    return c.json({
      data: {
        message: "If a user with that email exists, a password reset code has been sent"
      }
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return c.json({ error: "Failed to process request" }, { status: 500 });
  }
});

// src/routes/auth/reset-password.ts
import { eq as eq5 } from "drizzle-orm";
import { Hono as Hono6 } from "hono";
var resetPassword = new Hono6();
resetPassword.post("/reset-password", async (c) => {
  try {
    const { email, code, newPassword } = await c.req.json();
    if (!email || !code || !newPassword) {
      return c.json({ error: "Email, code, and new password are required" }, { status: 400 });
    }
    const user = await db.query.users.findFirst({
      where: (u, { eq: eq6 }) => eq6(u.email, email)
    });
    if (!user) {
      return c.json({ error: "User not found" }, { status: 404 });
    }
    const verification = await verifyCode(user, code, "password");
    if (!verification.success) {
      return c.json({ error: verification.error }, { status: 400 });
    }
    const account = await db.query.accounts.findFirst({
      where: (a, { eq: eq6, and }) => and(
        eq6(a.userId, user.id),
        eq6(a.type, "credentials")
      )
    });
    if (!account) {
      return c.json({ error: "Account not found" }, { status: 404 });
    }
    const hashedPassword = await hashPassword(newPassword);
    await db.update(accounts).set({ password: hashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(accounts.id, account.id));
    return c.json({
      data: {
        message: "Password reset successfully"
      }
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json({ error: "Failed to reset password" }, { status: 500 });
  }
});

// src/middleware/ratelimit.ts
import { getConnInfo as getConnInfo2 } from "@hono/node-server/conninfo";

// src/lib/redis.ts
import { createClient as createClient2 } from "redis";
var globalForRedis = global;
var redis = globalForRedis.redis || createClient2();
if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
  redis.connect().catch((err) => {
    console.error("Redis connection error", err);
  });
}
process.on("exit", async () => {
  if (redis.isOpen) {
    await redis.quit();
  }
});
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    if (redis.isOpen) {
      await redis.quit();
    }
    process.exit();
  });
});

// src/middleware/ratelimit.ts
function rateLimitMiddleware(limit, windowMs) {
  return async (c, next) => {
    const info = getConnInfo2(c);
    const ip = info.remote.address || c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown";
    const key = `ratelimit:${ip}`;
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pExpire(key, windowMs);
      }
      const ttl = await redis.pTTL(key);
      if (count > limit) {
        return c.json(
          {
            error: "Too many requests",
            message: "Please try again later"
          },
          429
        );
      }
      c.header("X-RateLimit-Limit", String(limit));
      c.header("X-RateLimit-Remaining", String(Math.max(0, limit - count)));
      c.header("X-RateLimit-Reset", String(Date.now() + Number(ttl)));
      await next();
    } catch (error) {
      console.error("Rate limiter Redis error:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Could not apply rate limiting"
        },
        500
      );
    }
  };
}

// src/routes/auth/index.ts
var authRoutes = new Hono7().basePath("/auth").use("/api/auth/*", rateLimitMiddleware(100, 60 * 1e3)).route("/", session).route("/", register).route("/", login).route("/", verify).route("/", forgotPassword).route("/", resetPassword);

// src/routes/public/index.ts
import { Hono as Hono9 } from "hono";

// src/config/site.ts
var siteConfig = {
  url: "http://localhost:3000",
  name: "Auth",
  description: "A lightweight, extensible authentication server",
  author: {
    name: "Mbatha Melusi",
    email: "mbathamelusi@gmail.com",
    url: "https://mbathamelusi.co.za"
  }
};

// src/routes/public/hello.ts
import { Hono as Hono8 } from "hono";
var hello = new Hono8();
hello.get("/", (c) => c.json({
  name: siteConfig.name,
  version: "1.0.0",
  status: "ok",
  message: "Auth server is running"
}));

// src/routes/public/index.ts
var publicRoutes = new Hono9().route("/", hello);

// src/config/cors.ts
var corsConfig = {
  origin: (origin) => {
    return origin || "*";
  },
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  exposeHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 600
};

// src/index.ts
var port = process.env.PORT || 3e3;
var app = new Hono10();
var customLogger = (message, ...rest) => {
  console.log(message, ...rest);
};
app.use("*", csrf());
app.use("*", cors(corsConfig));
app.use(logger());
app.use("*", compress());
app.use("*", prettyJSON());
app.route("/api", authRoutes).route("/", publicRoutes);
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});
serve(
  {
    fetch: app.fetch,
    port
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
export {
  customLogger
};
