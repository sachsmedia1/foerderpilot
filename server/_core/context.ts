import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, Tenant } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getTenantFromRequest } from "./tenantMiddleware";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  tenant: Tenant | null;
  isSuperAdminRoute: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let tenant: Tenant | null = null;
  let isSuperAdminRoute = false;

  // 1. Authenticate user
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // 2. Resolve tenant from request
  try {
    const tenantInfo = await getTenantFromRequest(opts.req);
    tenant = tenantInfo.tenant;
    isSuperAdminRoute = tenantInfo.isSuperAdminRoute;
  } catch (error) {
    // Tenant resolution failed - will be handled by procedures
    tenant = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    tenant,
    isSuperAdminRoute,
  };
}
