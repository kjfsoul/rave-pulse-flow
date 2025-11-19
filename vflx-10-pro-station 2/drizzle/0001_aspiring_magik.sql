CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` text NOT NULL,
	`challengeType` varchar(64) NOT NULL,
	`targetValue` varchar(64),
	`completed` boolean NOT NULL DEFAULT false,
	`points` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`artistName` varchar(255) NOT NULL,
	`fileKey` text NOT NULL,
	`url` text NOT NULL,
	`attributionCredits` text,
	`festivalScene` varchar(64),
	`votes` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`fileKey` text NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(64),
	`fileSize` int,
	`bpmDetected` int,
	`bpmAccurate` int,
	`musicalKey` varchar(16),
	`source` enum('upload','freesound','loudly') NOT NULL,
	`broadcastRightsConfirmed` boolean NOT NULL DEFAULT false,
	`attributionCredits` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `activeScene` varchar(64) DEFAULT 'deep_forest';--> statement-breakpoint
ALTER TABLE `users` ADD `aiGenerationCredits` int DEFAULT 10 NOT NULL;