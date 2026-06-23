CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instanceId` int NOT NULL,
	`whatsappId` varchar(50) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`name` varchar(200),
	`profilePicUrl` text,
	`notes` text,
	`tags` json,
	`funnelStage` enum('new_lead','contacted','negotiation','closed_won','closed_lost') NOT NULL DEFAULT 'new_lead',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evolution_instances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instanceName` varchar(100) NOT NULL,
	`apiUrl` varchar(500) NOT NULL,
	`apiKey` varchar(500) NOT NULL,
	`phoneNumber` varchar(20),
	`status` enum('disconnected','connecting','connected') NOT NULL DEFAULT 'disconnected',
	`qrCode` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evolution_instances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`category` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactId` int NOT NULL,
	`instanceId` int NOT NULL,
	`messageId` varchar(100),
	`direction` enum('incoming','outgoing') NOT NULL,
	`messageType` enum('text','image','audio','video','document','sticker') NOT NULL DEFAULT 'text',
	`content` text,
	`mediaUrl` text,
	`mediaMimeType` varchar(100),
	`status` enum('pending','sent','delivered','read','failed') NOT NULL DEFAULT 'pending',
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quick_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`messageType` enum('text','image','audio','video') NOT NULL DEFAULT 'text',
	`mediaUrl` text,
	`shortcut` varchar(20),
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quick_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactId` int NOT NULL,
	`instanceId` int NOT NULL,
	`messageType` enum('text','image','audio','video') NOT NULL DEFAULT 'text',
	`content` text,
	`mediaUrl` text,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(50) NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#3B82F6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
