import { z } from "zod";
import { router, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq, and, or, like, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const userManagementRouter = router({
  // Liste aller User des aktuellen Tenants (keine Super Admins, keine Teilnehmer)
  list: adminProcedure
    .input(
      z.object({
        role: z.enum(["admin", "kompass_reviewer", "user", "all"]).optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      if (!ctx.tenant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      const conditions = [
        eq(users.tenantId, ctx.tenant.id),
      ];

      // Filter nach Rolle
      if (input.role && input.role !== "all") {
        conditions.push(eq(users.role, input.role));
      }

      // Filter nach Status
      if (input.isActive !== undefined) {
        conditions.push(eq(users.isActive, input.isActive));
      }

      // Suche nach Name oder E-Mail
      if (input.search && input.search.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        conditions.push(
          or(
            like(users.name, searchTerm),
            like(users.email, searchTerm)
          )!
        );
      }

      const userList = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          loginMethod: users.loginMethod,
          lastSignedIn: users.lastSignedIn,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(...conditions));

      return userList;
    }),

  // User erstellen (nur für Tenant-Admins)
  create: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(1),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "kompass_reviewer", "user"]),
        password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!ctx.tenant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      // Prüfe ob E-Mail bereits existiert
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "E-Mail-Adresse wird bereits verwendet",
        });
      }

      // Hash Passwort
      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      // User erstellen
      const [newUser] = await db.insert(users).values({
        tenantId: ctx.tenant.id,
        email: input.email,
        name: input.name,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        role: input.role,
        passwordHash,
        loginMethod: "email",
        isActive: true,
      }).$returningId();

      return {
        success: true,
        userId: newUser.id,
      };
    }),

  // User aktualisieren
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        email: z.string().email().optional(),
        name: z.string().min(1).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        role: z.enum(["admin", "kompass_reviewer", "user"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!ctx.tenant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      // Prüfe ob User zum Tenant gehört
      const existingUser = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)))
        .limit(1);

      if (existingUser.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User nicht gefunden" });
      }

      // Wenn E-Mail geändert wird, prüfe ob neue E-Mail bereits existiert
      if (input.email && input.email !== existingUser[0].email) {
        const emailExists = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (emailExists.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "E-Mail-Adresse wird bereits verwendet",
          });
        }
      }

      const { id, ...updateData } = input;

      await db
        .update(users)
        .set(updateData)
        .where(and(eq(users.id, id), eq(users.tenantId, ctx.tenant.id)));

      return { success: true };
    }),

  // User Status togglen (aktivieren/deaktivieren)
  toggleStatus: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!ctx.tenant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      // Hole aktuellen Status
      const user = await db
        .select({ isActive: users.isActive })
        .from(users)
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User nicht gefunden" });
      }

      // Toggle Status
      await db
        .update(users)
        .set({ isActive: !user[0].isActive })
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)));

      return { success: true, newStatus: !user[0].isActive };
    }),

  // User löschen (soft delete durch isActive = false)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!ctx.tenant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      // Prüfe ob User existiert und zum Tenant gehört
      const user = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User nicht gefunden" });
      }

      // Soft delete: setze isActive = false
      await db
        .update(users)
        .set({ isActive: false })
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)));

      return { success: true };
    }),

  // User Details abrufen
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (!ctx.tenant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      const user = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          role: users.role,
          isActive: users.isActive,
          loginMethod: users.loginMethod,
          lastSignedIn: users.lastSignedIn,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(eq(users.id, input.id), eq(users.tenantId, ctx.tenant.id)))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User nicht gefunden" });
      }

      return user[0];
    }),
});
