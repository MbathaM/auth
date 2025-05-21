CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text DEFAULT 'credentials' NOT NULL,
	`password` text,
	`created_at` integer DEFAULT '"2025-05-21T09:04:57.237Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-05-21T09:04:57.237Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT '"2025-05-21T09:04:57.237Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`image` text,
	`created_at` integer DEFAULT '"2025-05-21T09:04:57.236Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-05-21T09:04:57.236Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text DEFAULT 'email' NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer DEFAULT '"2025-05-21T10:04:57.237Z"' NOT NULL
);
