CREATE TABLE `accounts` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `agencies` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name_sw` text NOT NULL,
	`name_en` text NOT NULL,
	`domain` text NOT NULL,
	`home_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agencies_code_unique` ON `agencies` (`code`);--> statement-breakpoint
CREATE TABLE `ai_cache` (
	`query_key` text PRIMARY KEY NOT NULL,
	`result_json` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_sw` text NOT NULL,
	`name_en` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `journey_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`keyword` text NOT NULL,
	`lang` text DEFAULT 'any' NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journey_keywords_unique_idx` ON `journey_keywords` (`journey_id`,`keyword`);--> statement-breakpoint
CREATE TABLE `journey_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`position` integer NOT NULL,
	`service_id` text NOT NULL,
	`note_sw` text,
	`note_en` text,
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journey_stages_position_idx` ON `journey_stages` (`journey_id`,`position`);--> statement-breakpoint
CREATE INDEX `journey_stages_service_idx` ON `journey_stages` (`service_id`);--> statement-breakpoint
CREATE TABLE `journeys` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_sw` text NOT NULL,
	`title_en` text NOT NULL,
	`summary_sw` text,
	`summary_en` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`verified_at` integer,
	`verified_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journeys_slug_unique` ON `journeys` (`slug`);--> statement-breakpoint
CREATE INDEX `journeys_status_idx` ON `journeys` (`status`);--> statement-breakpoint
CREATE TABLE `link_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`status_code` integer,
	`ok` integer NOT NULL,
	`checked_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `link_checks_url_idx` ON `link_checks` (`url`,`checked_at`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`step_position` integer,
	`kind` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`resolved_by` text,
	`resolved_at` integer,
	FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`);--> statement-breakpoint
CREATE INDEX `reports_target_idx` ON `reports` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`editor_id` text,
	`note` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`editor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `revisions_entity_idx` ON `revisions` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `search_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`query_redacted` text NOT NULL,
	`lang` text NOT NULL,
	`method` text NOT NULL,
	`top_type` text,
	`top_id` text,
	`confidence` real,
	`clicked` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `search_logs_created_idx` ON `search_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `search_logs_method_idx` ON `search_logs` (`method`);--> statement-breakpoint
CREATE TABLE `service_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`position` integer NOT NULL,
	`body_sw` text NOT NULL,
	`body_en` text NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_documents_position_idx` ON `service_documents` (`service_id`,`position`);--> statement-breakpoint
CREATE TABLE `service_keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`keyword` text NOT NULL,
	`lang` text DEFAULT 'any' NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_keywords_unique_idx` ON `service_keywords` (`service_id`,`keyword`);--> statement-breakpoint
CREATE TABLE `service_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`position` integer NOT NULL,
	`body_sw` text NOT NULL,
	`body_en` text NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_steps_position_idx` ON `service_steps` (`service_id`,`position`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`agency_id` text NOT NULL,
	`category_id` text NOT NULL,
	`title_sw` text NOT NULL,
	`title_en` text NOT NULL,
	`summary_sw` text,
	`summary_en` text,
	`official_url` text NOT NULL,
	`guide_level` text DEFAULT 'general' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`fee_note_sw` text,
	`fee_note_en` text,
	`time_note_sw` text,
	`time_note_en` text,
	`source_url` text,
	`verified_at` integer,
	`verified_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`agency_id`) REFERENCES `agencies`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `services_status_idx` ON `services` (`status`);--> statement-breakpoint
CREATE INDEX `services_category_idx` ON `services` (`category_id`);--> statement-breakpoint
CREATE INDEX `services_agency_idx` ON `services` (`agency_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer,
	`image` text,
	`role` text DEFAULT 'editor' NOT NULL,
	`invited_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
