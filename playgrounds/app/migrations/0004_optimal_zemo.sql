ALTER TABLE `snippets_table` ADD `bgType` text DEFAULT 'solid' NOT NULL;--> statement-breakpoint
ALTER TABLE `snippets_table` ADD `bgGradientColorStart` text DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE `snippets_table` ADD `bgGradientColorEnd` text DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE `snippets_table` ADD `bgGradientDirection` integer DEFAULT 0;