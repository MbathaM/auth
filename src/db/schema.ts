import { pgTable, text, boolean, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text('name'),
    email: text("email").unique().notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    role: text('role').notNull().default('user'),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

const verificationTypeEnum = pgEnum('verification_type', ['email', 'password']);

export const verifications = pgTable("verifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    // type: verificationTypeEnum("type").notNull().default("email"),
    type: text("type", { enum: ['email', 'password']}).notNull().default("email"), // "email" or "password"
    code: text("code").notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const sessions = pgTable("sessions", {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// const accountTypeEnum = pgEnum('account_type', ['oauth', 'credentials']);

export const accounts = pgTable("accounts", {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    // type: accountTypeEnum("type").notNull().default("credentials"),
    type: text("type", { enum: ['oauth', 'credentials'] }).notNull().default('credentials'),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});