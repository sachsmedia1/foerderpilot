CREATE TABLE `courseSchedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`courseId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`maxParticipants` int,
	`status` varchar(50) NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courseSchedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`templateType` varchar(100) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`bodyHtml` text NOT NULL,
	`bodyText` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participantWorkflowAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participantId` int NOT NULL,
	`questionId` int NOT NULL,
	`userInput` text,
	`aiGeneratedText` text,
	`finalText` text,
	`inputMethod` varchar(10) NOT NULL,
	`voiceFileUrl` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `participantWorkflowAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registrationSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(100) NOT NULL,
	`tenantId` int NOT NULL,
	`foerdercheck` json,
	`foerdercheckErgebnis` varchar(30),
	`courseId` int,
	`firstName` varchar(100),
	`lastName` varchar(100),
	`email` varchar(255),
	`phone` varchar(50),
	`street` varchar(255),
	`zipCode` varchar(10),
	`city` varchar(100),
	`company` varchar(255),
	`dateOfBirth` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `registrationSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `registrationSessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `vorvertraege` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`participantId` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`signedAt` timestamp,
	`signatureData` text,
	`ipAddress` varchar(50),
	`userAgent` text,
	`contractVersion` varchar(50) DEFAULT '1.0',
	`contractText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vorvertraege_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vorvertragTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`version` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`templateText` text NOT NULL,
	`checkboxZuarbeitText` text,
	`checkboxTeilnahmeText` text,
	`checkboxDatenschutzText` text,
	`checkboxAgbText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `vorvertragTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`questionNumber` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`aiPrompt` text NOT NULL,
	`helpText` text,
	`requiredSentencesMin` int DEFAULT 6,
	`requiredSentencesMax` int DEFAULT 10,
	`icon` varchar(50),
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `workflowQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(20) NOT NULL DEFAULT 'client',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflowTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tenants` MODIFY COLUMN `subdomain` varchar(100);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `courses` ADD `workflowTemplateId` int;--> statement-breakpoint
ALTER TABLE `documents` ADD `tenantId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `filename` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `validationStatus` varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `participants` ADD `courseScheduleId` int;--> statement-breakpoint
ALTER TABLE `tenants` ADD `agbUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `tenants` ADD `widerrufsbelehrungUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `emailTemplates` ADD CONSTRAINT `emailTemplates_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantWorkflowAnswers` ADD CONSTRAINT `participantWorkflowAnswers_participantId_participants_id_fk` FOREIGN KEY (`participantId`) REFERENCES `participants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `participantWorkflowAnswers` ADD CONSTRAINT `participantWorkflowAnswers_questionId_workflowQuestions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `workflowQuestions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registrationSessions` ADD CONSTRAINT `registrationSessions_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `registrationSessions` ADD CONSTRAINT `registrationSessions_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vorvertragTemplates` ADD CONSTRAINT `vorvertragTemplates_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vorvertragTemplates` ADD CONSTRAINT `vorvertragTemplates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflowQuestions` ADD CONSTRAINT `workflowQuestions_templateId_workflowTemplates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `workflowTemplates`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflowTemplates` ADD CONSTRAINT `workflowTemplates_tenantId_tenants_id_fk` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `documents` DROP COLUMN `fileName`;--> statement-breakpoint
ALTER TABLE `documents` DROP COLUMN `isValidated`;--> statement-breakpoint
ALTER TABLE `documents` DROP COLUMN `validationErrors`;