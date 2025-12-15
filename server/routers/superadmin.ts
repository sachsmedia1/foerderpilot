/**
 * FOERDERPILOT - SUPER ADMIN ROUTER
 * 
 * Routen für Super Admin Funktionen:
 * - Tenant-Management (CRUD)
 * - System-Übersicht
 * - User-Management (alle Tenants)
 */

import { router, superAdminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getAllTenants, getTenantById, getUsersByTenantId } from "../db";
import { tenants, users, workflowTemplates, workflowQuestions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";

/**
 * Helper: Duplicate KOMPASS Standard template for new tenant
 */
async function duplicateSystemTemplateForTenant(db: MySql2Database<any>, tenantId: number) {
  // Find KOMPASS Standard template
  const [standardTemplate] = await db
    .select()
    .from(workflowTemplates)
    .where(eq(workflowTemplates.name, 'KOMPASS Standard'))
    .limit(1);

  if (!standardTemplate) {
    console.warn('[duplicateSystemTemplateForTenant] KOMPASS Standard template not found');
    return;
  }

  // Get questions
  const questions = await db
    .select()
    .from(workflowQuestions)
    .where(eq(workflowQuestions.templateId, standardTemplate.id))
    .orderBy(workflowQuestions.sortOrder);

  // Create tenant copy
  const [newTemplate] = await db
    .insert(workflowTemplates)
    .values({
      tenantId,
      name: standardTemplate.name,
      description: standardTemplate.description,
      type: 'client',
      isActive: true,
    });

  const newTemplateId = Number(newTemplate.insertId);

  // Copy questions
  if (questions.length > 0) {
    await db.insert(workflowQuestions).values(
      questions.map(q => ({
        templateId: newTemplateId,
        questionNumber: q.questionNumber,
        title: q.title,
        description: q.description,
        aiPrompt: q.aiPrompt,
        helpText: q.helpText,
        requiredSentencesMin: q.requiredSentencesMin,
        requiredSentencesMax: q.requiredSentencesMax,
        icon: q.icon,
        sortOrder: q.sortOrder,
      }))
    );
  }

  console.log(`[duplicateSystemTemplateForTenant] Created template ${newTemplateId} for tenant ${tenantId}`);
}

export const superadminRouter = router({
  // ============================================================================
  // TENANT MANAGEMENT
  // ============================================================================
  
  /**
   * Liste aller Tenants
   */
  listTenants: superAdminProcedure.query(async () => {
    const allTenants = await getAllTenants();
    return allTenants;
  }),

  /**
   * Einzelnen Tenant abrufen
   */
  getTenant: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const tenant = await getTenantById(input.id);
      if (!tenant) {
        throw new Error("Tenant not found");
      }
      return tenant;
    }),

  /**
   * Neuen Tenant erstellen
   */
  createTenant: superAdminProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        // subdomain ENTFERNT - wird auto-generiert
        companyName: z.string().min(1),
        directorName: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        street: z.string().optional(),
        zipCode: z.string().optional(),
        city: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        logoUrl: z.string().optional(),
        faviconUrl: z.string().optional(),
        customDomain: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Auto-generate name from companyName
      const name = input.name || input.companyName;
      
      // Auto-generate subdomain from companyName (Fallback, nicht angezeigt)
      const baseSubdomain = input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
      
      // Prüfe ob Subdomain bereits existiert (Collision)
      const existingTenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, baseSubdomain))
        .limit(1);
      
      // Wenn Collision: Füge Zufalls-Suffix hinzu
      const subdomain = existingTenant.length > 0
        ? `${baseSubdomain}-${Math.random().toString(36).substring(2, 7)}`
        : baseSubdomain;

      const [tenant] = await db
        .insert(tenants)
        .values({
          name,
          subdomain,
          companyName: input.companyName,
          directorName: input.directorName || null,
          email: input.email,
          phone: input.phone || null,
          street: input.street || null,
          zipCode: input.zipCode || null,
          city: input.city || null,
          primaryColor: input.primaryColor || "#1E40AF",
          secondaryColor: input.secondaryColor || "#3B82F6",
          logoUrl: input.logoUrl || null,
          faviconUrl: input.faviconUrl || null,
          customDomain: input.customDomain || null,
          isActive: true,
        })
        .$returningId();

      // Auto-duplicate KOMPASS Standard template for new tenant
      try {
        await duplicateSystemTemplateForTenant(db, tenant.id);
      } catch (error) {
        console.error('[createTenant] Failed to duplicate standard template:', error);
        // Don't fail tenant creation if template duplication fails
      }

      return tenant;
    }),

  /**
   * Tenant aktualisieren
   */
  updateTenant: superAdminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        // subdomain ENTFERNT - nicht mehr änderbar
        companyName: z.string().min(1).optional(),
        directorName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        street: z.string().optional(),
        zipCode: z.string().optional(),
        city: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        logoUrl: z.string().optional(),
        faviconUrl: z.string().optional(),
        customDomain: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      await db
        .update(tenants)
        .set(updateData)
        .where(eq(tenants.id, id));

      return { success: true };
    }),

  /**
   * Tenant deaktivieren/aktivieren
   */
  toggleTenantStatus: superAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tenant = await getTenantById(input.id);
      if (!tenant) {
        throw new Error("Tenant not found");
      }

      await db
        .update(tenants)
        .set({ isActive: !tenant.isActive })
        .where(eq(tenants.id, input.id));

      return { success: true, isActive: !tenant.isActive };
    }),

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Alle Users eines Tenants abrufen
   */
  getTenantUsers: superAdminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      const tenantUsers = await getUsersByTenantId(input.tenantId);
      return tenantUsers;
    }),

  /**
   * User-Rolle ändern
   */
  updateUserRole: superAdminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["super_admin", "admin", "kompass_reviewer", "user"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Benutzer für Bildungsträger erstellen (Super Admin)
   */
  createTenantUser: superAdminProcedure
    .input(
      z.object({
        tenantId: z.number(),
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1).optional(),
        role: z.enum(["admin", "user", "kompass_reviewer"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Prüfe ob E-Mail bereits existiert
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("E-Mail bereits vergeben");
      }

      // Prüfe ob Tenant existiert
      const tenant = await getTenantById(input.tenantId);
      if (!tenant) {
        throw new Error("Bildungsträger nicht gefunden");
      }

      // Passwort hashen
      const bcrypt = await import("bcrypt");
      const passwordHash = await bcrypt.hash(input.password, 10);

      // User erstellen
      // ✅ FIX: openId = email für E-Mail/Passwort Auth (damit getUserByOpenId funktioniert)
      await db
        .insert(users)
        .values({
          tenantId: input.tenantId,
          email: input.email,
          openId: input.email, // ← WICHTIG: openId = email für E-Mail Auth
          passwordHash,
          name: input.name || input.email.split("@")[0],
          role: input.role,
          loginMethod: "email",
          isActive: true,
        });

      // User abrufen
      const [newUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      return newUser;
    }),

  // ============================================================================
  // SYSTEM OVERVIEW
  // ============================================================================

  /**
   * System-Statistiken
   */
  getSystemStats: superAdminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allTenants = await getAllTenants();
    const activeTenants = allTenants.filter((t) => t.isActive);

    // Zähle alle Users
    const allUsers = await db.select().from(users);
    const superAdmins = allUsers.filter((u) => u.role === "super_admin");
    const admins = allUsers.filter((u) => u.role === "admin");
    const kompassReviewers = allUsers.filter((u) => u.role === "kompass_reviewer");
    const regularUsers = allUsers.filter((u) => u.role === "user");

    return {
      tenants: {
        total: allTenants.length,
        active: activeTenants.length,
        inactive: allTenants.length - activeTenants.length,
      },
      users: {
        total: allUsers.length,
        superAdmins: superAdmins.length,
        admins: admins.length,
        kompassReviewers: kompassReviewers.length,
        regularUsers: regularUsers.length,
      },
    };
  }),
});
