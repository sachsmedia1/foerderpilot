import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tenants, courses, participants, documents, sammeltermins } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || '',
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod", "firstName", "lastName", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    // Email separat behandeln (required field)
    if (user.email !== undefined) {
      values.email = user.email || '';
      updateSet.email = user.email || '';
    }

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      // Owner bekommt super_admin Rolle
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    // TenantId setzen falls vorhanden
    if (user.tenantId !== undefined) {
      values.tenantId = user.tenantId;
      updateSet.tenantId = user.tenantId;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// TENANT QUERIES
// ============================================================================

export async function getTenantBySubdomain(subdomain: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantByCustomDomain(customDomain: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.customDomain, customDomain)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTenants() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tenants);
}

// ============================================================================
// USER QUERIES
// ============================================================================

export async function getUsersByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users).where(eq(users.tenantId, tenantId));
}

// ============================================================================
// COURSE QUERIES
// ============================================================================

export async function getCoursesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(courses).where(eq(courses.tenantId, tenantId));
}

// ============================================================================
// PARTICIPANT QUERIES
// ============================================================================

export async function getParticipantsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(participants).where(eq(participants.tenantId, tenantId));
}

// ============================================================================
// DOCUMENT QUERIES
// ============================================================================

export async function getDocumentsByParticipantId(participantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(documents).where(eq(documents.participantId, participantId));
}

// ============================================================================
// SAMMELTERMIN QUERIES
// ============================================================================

export async function getSammelterminsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(sammeltermins).where(eq(sammeltermins.tenantId, tenantId));
}
