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
import { tenants, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
        subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
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

      // Auto-generate name and subdomain from companyName if not provided
      const name = input.name || input.companyName;
      const subdomain = input.subdomain || input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);

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
        subdomain: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
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
