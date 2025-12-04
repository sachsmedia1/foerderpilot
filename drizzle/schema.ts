import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, date } from "drizzle-orm/mysql-core";

/**
 * FOERDERPILOT - MULTI-TENANT SAAS DATABASE SCHEMA
 * 
 * Core tables for Phase 1 MVP:
 * - tenants: Bildungsträger (Multi-Tenancy)
 * - users: Multi-Role (super_admin, admin, kompass_reviewer, user)
 * - courses: Kurse
 * - participants: Teilnehmer
 * - documents: Dokumente mit AI-Validierung
 * - sammeltermins: KOMPASS-Termine
 * 
 * i18n-ready: Alle Text-Felder sind vorbereitet für spätere Mehrsprachigkeit
 */

// ============================================================================
// TENANTS (Bildungsträger)
// ============================================================================
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basis-Informationen
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).unique().notNull(),
  customDomain: varchar("customDomain", { length: 255 }),
  
  // Branding (Dynamic White-Label)
  logoUrl: varchar("logoUrl", { length: 500 }),
  faviconUrl: varchar("faviconUrl", { length: 500 }),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#1E40AF"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#3B82F6"),
  
  // Stammdaten
  companyName: varchar("companyName", { length: 255 }).notNull(),
  taxId: varchar("taxId", { length: 50 }),
  street: varchar("street", { length: 255 }),
  zipCode: varchar("zipCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // Zertifizierungen (KOMPASS-relevant)
  certificationType: varchar("certificationType", { length: 50 }), // 'AZAV', 'ISO9001', 'custom'
  certificationFileUrl: varchar("certificationFileUrl", { length: 500 }),
  certificationValidUntil: timestamp("certificationValidUntil"),
  
  // Geschäftsführung
  directorName: varchar("directorName", { length: 255 }),
  directorSignatureUrl: varchar("directorSignatureUrl", { length: 500 }),
  
  // Rechtliches
  impressumHtml: text("impressumHtml"),
  privacyPolicyUrl: varchar("privacyPolicyUrl", { length: 500 }),
  
  // Meta
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

// ============================================================================
// USERS (Multi-Role: Super Admin, Tenant Admin, KOMPASS Reviewer, Teilnehmer)
// ============================================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  
  // Tenant-Zuordnung (NULL = Super Admin)
  tenantId: int("tenantId"),
  
  // Manus OAuth (optional für Super Admins)
  openId: varchar("openId", { length: 64 }).unique(),
  
  // Basis-Informationen
  email: varchar("email", { length: 320 }).notNull(),
  name: text("name"),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  
  // Auth & Rolle
  loginMethod: varchar("loginMethod", { length: 64 }), // 'oauth', 'email'
  passwordHash: varchar("passwordHash", { length: 255 }), // bcrypt hash
  role: mysqlEnum("role", ["super_admin", "admin", "kompass_reviewer", "user"]).default("user").notNull(),
  
  // Passwort-Reset
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  
  // Meta
  isActive: boolean("isActive").default(true).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// COURSES (Kurse)
// ============================================================================
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  
  // Basis-Informationen (i18n-ready)
  name: varchar("name", { length: 255 }).notNull(),
  shortDescription: text("shortDescription"),
  detailedDescription: text("detailedDescription"),
  topics: text("topics"), // JSON-Array für spätere Mehrsprachigkeit
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  
  // Termine & Dauer
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  duration: int("duration"), // in Stunden
  scheduleType: varchar("scheduleType", { length: 50 }), // 'weeks', 'days', 'custom'
  scheduleDetails: json("scheduleDetails"), // z.B. {weeks: 6, sessionsPerWeek: 2, hoursPerSession: 2}
  
  // Kosten & Förderung
  priceNet: int("priceNet").notNull(), // in Cent
  priceGross: int("priceGross").notNull(),
  subsidyPercentage: int("subsidyPercentage").default(90), // KOMPASS: 90%
  
  // Trainer & Qualifikationen
  trainerNames: varchar("trainerNames", { length: 500 }),
  trainerQualifications: text("trainerQualifications"),
  
  // Dokumente
  offerTemplateUrl: varchar("offerTemplateUrl", { length: 500 }),
  syllabusUrl: varchar("syllabusUrl", { length: 500 }),
  
  // Meta
  isActive: boolean("isActive").default(true).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  maxParticipants: int("maxParticipants"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ============================================================================
// COURSE SCHEDULES (Kurstermine - Starttermine für Kurs-Durchgänge)
// ============================================================================
export const courseSchedules = mysqlTable("courseSchedules", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  courseId: int("courseId").notNull(),
  
  // Termin-Informationen
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  
  // Kapazität
  maxParticipants: int("maxParticipants"),
  
  // Status
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  
  // Notizen
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseSchedule = typeof courseSchedules.$inferSelect;
export type InsertCourseSchedule = typeof courseSchedules.$inferInsert;

// ============================================================================
// SAMMELTERMINS (Kollektiv-Termine mit KOMPASS)
// ============================================================================
export const sammeltermins = mysqlTable("sammeltermins", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  courseId: int("courseId"),
  
  // Termin-Informationen
  date: timestamp("date").notNull(),
  zoomLink: varchar("zoomLink", { length: 500 }),
  kompassReviewerEmail: varchar("kompassReviewerEmail", { length: 255 }),
  
  // Deadline für Dokument-Einreichung (1 Tag vorher)
  submissionDeadline: timestamp("submissionDeadline").notNull(),
  
  // Status
  status: varchar("status", { length: 50 }).default("scheduled").notNull(), // 'scheduled', 'completed', 'cancelled'
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sammeltermin = typeof sammeltermins.$inferSelect;
export type InsertSammeltermin = typeof sammeltermins.$inferInsert;

// ============================================================================
// PARTICIPANTS (Teilnehmer)
// ============================================================================
export const participants = mysqlTable("participants", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  courseScheduleId: int("courseScheduleId"), // Zuordnung zu spezifischem Kurstermin
  sammelterminId: int("sammelterminId"),
  
  // Status-Pipeline (13 Schritte)
  status: varchar("status", { length: 50 }).default("registered").notNull(),
  // 1. registered → 2. onboarding → 3. documents_uploading → 4. documents_complete →
  // 5. documents_approved → 6. zeus_pending → 7. zeus_completed → 8. kompass_submitted →
  // 9. kompass_approved → 10. course_enrolled → 11. course_active → 12. course_completed →
  // 13. certificate_issued
  
  // Persönliche Daten
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  dateOfBirth: timestamp("dateOfBirth"),
  
  // Adresse
  street: varchar("street", { length: 255 }),
  zipCode: varchar("zipCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Deutschland"),
  
  // Notizen & Meta
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = typeof participants.$inferInsert;

// ============================================================================
// DOCUMENTS (Dokumente mit AI-Validierung)
// ============================================================================
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  participantId: int("participantId").notNull(),
  
  // Dokument-Informationen
  documentType: varchar("documentType", { length: 100 }).notNull(),
  // Typen: 'personalausweis', 'lebenslauf', 'zeugnisse', 'arbeitsvertrag', 'kuendigungsbestaetigung', 'other'
  filename: varchar("filename", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // in Bytes
  
  // AI-Validierung
  validationStatus: varchar("validationStatus", { length: 50 }).default("pending").notNull(),
  // Stati: 'pending', 'validating', 'valid', 'invalid', 'manual_review'
  validationResult: text("validationResult"), // JSON als String
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  validatedAt: timestamp("validatedAt"),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================================================
// VORVERTRÄGE (Pre-Contracts - Digitale Vertragsunterzeichnung)
// ============================================================================
export const vorvertraege = mysqlTable("vorvertraege", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  participantId: int("participantId").notNull(),
  
  // Vertrags-Status
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  // Stati: 'pending', 'signed', 'declined'
  
  // Unterschrift-Informationen
  signedAt: timestamp("signedAt"),
  signatureData: text("signatureData"), // Base64-encoded signature image or text
  
  // Tracking (für Rechtssicherheit)
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  
  // Vertrags-Inhalt (optional - falls dynamisch)
  contractVersion: varchar("contractVersion", { length: 50 }).default("1.0"),
  contractText: text("contractText"), // Optional: Gespeicherter Vertragstext
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vorvertrag = typeof vorvertraege.$inferSelect;
export type InsertVorvertrag = typeof vorvertraege.$inferInsert;


// ============================================================================
// DATABASE INDEXES (Performance-Optimierung)
// ============================================================================
import { index } from "drizzle-orm/mysql-core";

// Indexes für Tenants
export const tenantsBySubdomain = index("idx_tenants_subdomain").on(tenants.subdomain);
export const tenantsByCustomDomain = index("idx_tenants_custom_domain").on(tenants.customDomain);

// Indexes für Users
export const usersByTenantId = index("idx_users_tenant_id").on(users.tenantId);
export const usersByEmail = index("idx_users_email").on(users.email);
export const usersByOpenId = index("idx_users_open_id").on(users.openId);

// Indexes für Courses
export const coursesByTenantId = index("idx_courses_tenant_id").on(courses.tenantId);
export const coursesByStatus = index("idx_courses_status").on(courses.isActive, courses.isPublished);

// Indexes für Course Schedules
export const courseSchedulesByTenantId = index("idx_course_schedules_tenant_id").on(courseSchedules.tenantId);
export const courseSchedulesByCourseId = index("idx_course_schedules_course_id").on(courseSchedules.courseId);

// Indexes für Participants
export const participantsByTenantId = index("idx_participants_tenant_id").on(participants.tenantId);
export const participantsByCourseId = index("idx_participants_course_id").on(participants.courseId);
export const participantsByStatus = index("idx_participants_status").on(participants.status);
export const participantsByUserId = index("idx_participants_user_id").on(participants.userId);
export const participantsByCourseScheduleId = index("idx_participants_course_schedule_id").on(participants.courseScheduleId);

// Indexes für Documents
export const documentsByTenantId = index("idx_documents_tenant_id").on(documents.tenantId);
export const documentsByParticipantId = index("idx_documents_participant_id").on(documents.participantId);
export const documentsByValidationStatus = index("idx_documents_validation_status").on(documents.validationStatus);

// Indexes für Sammeltermins
export const sammelterminsByTenantId = index("idx_sammeltermins_tenant_id").on(sammeltermins.tenantId);
export const sammelterminsByCourseId = index("idx_sammeltermins_course_id").on(sammeltermins.courseId);
export const sammelterminsByStatus = index("idx_sammeltermins_status").on(sammeltermins.status);


// ============================================================================
// E-MAIL TEMPLATES (Editierbare E-Mail-Vorlagen)
// ============================================================================
export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  
  // Template-Typ
  templateType: varchar("templateType", { length: 100 }).notNull(), // 'welcome', 'password_reset', 'document_validation_valid', 'document_validation_invalid', 'sammeltermin_reminder', 'status_change'
  
  // E-Mail-Inhalt
  subject: varchar("subject", { length: 500 }).notNull(),
  bodyHtml: text("bodyHtml").notNull(),
  bodyText: text("bodyText"), // Plain-Text-Fallback (optional)
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Index für E-Mail-Templates
export const emailTemplatesByTenantId = index("idx_email_templates_tenant_id").on(emailTemplates.tenantId);
export const emailTemplatesByType = index("idx_email_templates_type").on(emailTemplates.templateType);


// ============================================================================
// REGISTRATION SESSIONS (Temp-Daten für Funnel)
// ============================================================================
export const registrationSessions = mysqlTable("registrationSessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull().unique(),
  tenantId: int("tenantId").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  
  // Step 1: Fördercheck
  foerdercheck: json("foerdercheck"), // JSON mit allen Antworten
  foerdercheckErgebnis: varchar("foerdercheckErgebnis", { length: 30 }), // '90_kompass_erst', '50_bafa_mitarbeiter', etc.
  
  // Step 2: Kursauswahl
  courseId: int("courseId").references(() => courses.id, { onDelete: "set null" }),
  
  // Step 3: Persönliche Daten
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  street: varchar("street", { length: 255 }),
  zipCode: varchar("zipCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  company: varchar("company", { length: 255 }),
  dateOfBirth: date("dateOfBirth"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"), // Auto-Cleanup nach 2 Stunden
});

export type RegistrationSession = typeof registrationSessions.$inferSelect;
export type InsertRegistrationSession = typeof registrationSessions.$inferInsert;

// Indexes für Registration Sessions
export const registrationSessionsBySessionId = index("idx_registrationSessions_sessionId").on(registrationSessions.sessionId);
export const registrationSessionsByExpires = index("idx_registrationSessions_expires").on(registrationSessions.expiresAt);

// ============================================================================
// VORVERTRAG TEMPLATES (Editierbare Vorvertrag-Vorlagen)
// ============================================================================
export const vorvertragTemplates = mysqlTable("vorvertragTemplates", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  
  // Version
  version: varchar("version", { length: 10 }).notNull(), // '1.0', '1.1', etc.
  isActive: boolean("isActive").default(false).notNull(),
  
  // Template-Text
  templateText: text("templateText").notNull(), // Vorvertrag mit Platzhaltern
  
  // Checkbox-Texte
  checkboxZuarbeitText: text("checkboxZuarbeitText"),
  checkboxTeilnahmeText: text("checkboxTeilnahmeText"),
  checkboxDatenschutzText: text("checkboxDatenschutzText"),
  checkboxAgbText: text("checkboxAgbText"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
});

export type VorvertragTemplate = typeof vorvertragTemplates.$inferSelect;
export type InsertVorvertragTemplate = typeof vorvertragTemplates.$inferInsert;

// Indexes für Vorvertrag Templates
export const vorvertragTemplatesByTenantId = index("idx_vorvertragTemplates_tenant").on(vorvertragTemplates.tenantId);
export const vorvertragTemplatesByActive = index("idx_vorvertragTemplates_active").on(vorvertragTemplates.tenantId, vorvertragTemplates.isActive);
