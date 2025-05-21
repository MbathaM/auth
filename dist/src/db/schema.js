import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text('name'),
    email: text("email").unique().notNull(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    role: text('role').notNull().default('user'),
    image: text('image'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date())
});
export const verifications = sqliteTable("verifications", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type", { enum: ['email', 'password'] }).notNull().default("email"), // "email" or "password"
    code: text("code").notNull(), // 6 digit code
    expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull().default(new Date(Date.now() + 1000 * 60 * 60)), // 1 hour
});
export const sessions = sqliteTable("sessions", {
    id: text('id').primaryKey(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
});
export const accounts = sqliteTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text("type", { enum: ["oauth", "credentials"] }).notNull().default("credentials"), // "credentials" or "oauth"
    password: text("password"), // Nullable for OAuth
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(new Date()),
});
