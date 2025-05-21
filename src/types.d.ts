import type { sessions, users } from "./db/schema";

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;