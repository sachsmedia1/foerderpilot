import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// Admin Procedure: Für Tenant-Admins und Super Admins
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Super Admin hat immer Zugriff
    if (ctx.user?.role === 'super_admin') {
      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
          tenant: ctx.tenant,
        },
      });
    }

    // Für normale Admins: Prüfe Rolle und Tenant-Zugehörigkeit
    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    // Admin muss einem Tenant zugeordnet sein
    if (!ctx.user.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin must belong to a tenant" });
    }

    // Tenant muss im Context vorhanden sein
    if (!ctx.tenant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
    }

    // Admin muss zum aktuellen Tenant gehören
    if (ctx.user.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied to this tenant" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        tenant: ctx.tenant,
      },
    });
  }),
);

// Super Admin Procedure: Nur für Super Admins
export const superAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'super_admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: "Super admin access required" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Tenant Procedure: Für alle authentifizierten User mit Tenant-Zugriff
export const tenantProcedure = protectedProcedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // ctx.user ist garantiert vorhanden durch protectedProcedure, aber TypeScript weiß das nicht
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    const user = ctx.user;

    // Tenant muss im Context vorhanden sein (außer für Super Admin)
    if (!ctx.tenant && user.role !== 'super_admin') {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
    }

    // Validiere Tenant-Zugriff
    if (ctx.tenant && user.tenantId !== ctx.tenant.id && user.role !== 'super_admin' && user.role !== 'kompass_reviewer') {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied to this tenant" });
    }

    return next({
      ctx: {
        ...ctx,
        user,
        tenant: ctx.tenant,
      },
    });
  }),
);
