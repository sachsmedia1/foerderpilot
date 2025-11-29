CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`shortDescription` text,
	`detailedDescription` text,
	`topics` text,
	`websiteUrl` varchar(500),
	`startDate` timestamp,
	`endDate` timestamp,
	`duration` int,
	`scheduleType` varchar(50),
	`scheduleDetails` json,
	`priceNet` int NOT NULL,
	`priceGross` int NOT NULL,
	`subsidyPercentage` int DEFAULT 90,
	`trainerNames` varchar(500),
	`trainerQualifications` text,
	`offerTemplateUrl` varchar(500),
	`syllabusUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`isPublished` boolean NOT NULL DEFAULT false,
	`maxParticipants` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participantId` int NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`isValidated` boolean NOT NULL DEFAULT false,
	`validationResult` text,
	`validationErrors` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`validatedAt` timestamp,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`sammelterminId` int,
	`status` varchar(50) NOT NULL DEFAULT 'registered',
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`dateOfBirth` timestamp,
	`street` varchar(255),
	`zipCode` varchar(10),
	`city` varchar(100),
	`country` varchar(100) DEFAULT 'Deutschland',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sammeltermins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`courseId` int,
	`date` timestamp NOT NULL,
	`zoomLink` varchar(500),
	`kompassReviewerEmail` varchar(255),
	`submissionDeadline` timestamp NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sammeltermins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subdomain` varchar(100) NOT NULL,
	`customDomain` varchar(255),
	`logoUrl` varchar(500),
	`faviconUrl` varchar(500),
	`primaryColor` varchar(7) DEFAULT '#1E40AF',
	`secondaryColor` varchar(7) DEFAULT '#3B82F6',
	`companyName` varchar(255) NOT NULL,
	`taxId` varchar(50),
	`street` varchar(255),
	`zipCode` varchar(10),
	`city` varchar(100),
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`certificationType` varchar(50),
	`certificationFileUrl` varchar(500),
	`certificationValidUntil` timestamp,
	`directorName` varchar(255),
	`directorSignatureUrl` varchar(500),
	`impressumHtml` text,
	`privacyPolicyUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_subdomain_unique` UNIQUE(`subdomain`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','kompass_reviewer','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `tenantId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `firstName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;