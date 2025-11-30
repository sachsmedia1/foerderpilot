import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { superadminRouter } from "./routers/superadmin";
import { coursesRouter } from './routers/courses';
import { courseSchedulesRouter } from './routers/courseSchedules';
import { sammelterminsRouter } from "./routers/sammeltermins";
import { documentsRouter } from "./routers/documents";
import { participantsRouter } from "./routers/participants";
import { tenantSettingsRouter } from "./routers/tenantSettings";
import { userManagementRouter } from "./routers/userManagement";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  superadmin: superadminRouter,
  courses: coursesRouter,
  courseSchedules: courseSchedulesRouter,
  sammeltermins: sammelterminsRouter,
  documents: documentsRouter,
  participants: participantsRouter,
  tenantSettings: tenantSettingsRouter,
  userManagement: userManagementRouter,
  // TODO: Add more feature routers here
  
  auth: router({
    me: publicProcedure.query(opts => ({
      user: opts.ctx.user,
      tenant: opts.ctx.tenant,
      isSuperAdminRoute: opts.ctx.isSuperAdminRoute,
      isMaintenanceMode: opts.ctx.isMaintenanceMode,
    })),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
