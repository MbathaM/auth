PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text DEFAULT 'credentials' NOT NULL,
	`password` text,
	`created_at` integer DEFAULT '"2025-05-21T23:45:19.901Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-05-21T23:45:19.901Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("id", "account_id", "provider_id", "user_id", "type", "password", "created_at", "updated_at") SELECT "id", "account_id", "provider_id", "user_id", "type", "password", "created_at", "updated_at" FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-05-21T23:45:19.899Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "token", "ip_address", "user_agent", "user_id", "expires_at", "created_at") SELECT "id", "token", "ip_address", "user_agent", "user_id", "expires_at", "created_at" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`image` text,
	`created_at` integer DEFAULT '"2025-05-21T23:45:19.895Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-05-21T23:45:19.896Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "role", "image", "created_at", "updated_at") SELECT "id", "name", "email", "email_verified", "role", "image", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `__new_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text DEFAULT 'email' NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer DEFAULT '"2025-05-22T00:45:19.898Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_verifications`("id", "user_id", "type", "code", "expiresAt") SELECT "id", "user_id", "type", "code", "expiresAt" FROM `verifications`;--> statement-breakpoint
DROP TABLE `verifications`;--> statement-breakpoint
ALTER TABLE `__new_verifications` RENAME TO `verifications`;