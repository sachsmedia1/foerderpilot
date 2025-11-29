import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

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
  
  // Manus OAuth
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  
  // Basis-Informationen
  email: varchar("email", { length: 320 }).notNull(),
  name: text("name"),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  
  // Auth & Rolle
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "admin", "kompass_reviewer", "user"]).default("user").notNull(),
  
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
  sammelterminId: int("sammelterminId"),
  
  // Status-Pipeline (13 Schritte)
  status: varchar("status", { length: 50 }).default("registered").notNull(),
  // Stati: registered, onboarding, documents_uploading, documents_complete,
  // vorvertrag_sent, vorvertrag_signed, zeus_pending, zeus_completed,
  // kompass_submitted, kompass_approved, course_enrolled, course_active, course_completed
  
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
  participantId: int("participantId").notNull(),
  
  // Dokument-Informationen
  documentType: varchar("documentType", { length: 100 }).notNull(),
  // Typen: 'personalausweis_front', 'personalausweis_back', 'lebenslauf',
  // 'bildungsgutschein', 'bewerbungsschreiben', 'beratungsprotokoll', 'vorvertrag'
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // in Bytes
  
  // AI-Validierung
  isValidated: boolean("isValidated").default(false).notNull(),
  validationResult: text("validationResult"), // JSON als String
  validationErrors: text("validationErrors"), // JSON als String
  
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  validatedAt: timestamp("validatedAt"),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
