import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { participants, documents, courses, sammeltermins } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const dashboardRouter = router({
  /**
   * Get dashboard statistics (KPIs)
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tenantId = ctx.user!.tenantId;

    // Teilnehmer-Count
    const allParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.tenantId, tenantId));
    
    const participantCount = allParticipants.length;

    // Kurse-Count
    const allCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.tenantId, tenantId));
    
    const courseCount = allCourses.length;

    // Sammeltermine-Count
    const allSammeltermins = await db
      .select()
      .from(sammeltermins)
      .where(eq(sammeltermins.tenantId, tenantId));
    
    const sammelterminCount = allSammeltermins.length;

    // Dokument-Validation-Rate
    // @ts-expect-error Drizzle ORM 0.44.5 TypeScript issue with eq()
    const allDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId));
    
    const totalDocs = allDocs.length;
    const validDocs = allDocs.filter(doc => doc.validationStatus === "valid").length;
    const validationRate = totalDocs > 0 ? Math.round((validDocs / totalDocs) * 100) : 0;

    // Status-Verteilung (für Pie Chart)
    const statusMap = new Map<string, number>();
    allParticipants.forEach(p => {
      const current = statusMap.get(p.status) || 0;
      statusMap.set(p.status, current + 1);
    });

    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return {
      participantCount,
      courseCount,
      sammelterminCount,
      validationRate,
      totalDocs,
      validDocs,
      statusDistribution,
    };
  }),

  /**
   * Get recent activities (last 10 participants)
   */
  getRecentActivities: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tenantId = ctx.user!.tenantId;

    const recentParticipants = await db
      .select({
        id: participants.id,
        firstName: participants.firstName,
        lastName: participants.lastName,
        email: participants.email,
        status: participants.status,
        createdAt: participants.createdAt,
        courseId: participants.courseId,
      })
      .from(participants)
      .where(eq(participants.tenantId, tenantId))
      .orderBy(desc(participants.createdAt))
      .limit(10);

    // Fetch course names for participants
    const participantsWithCourses = await Promise.all(
      recentParticipants.map(async (participant) => {
        if (!participant.courseId) {
          return { ...participant, courseName: null };
        }

        const courseResult = await db
          .select({ name: courses.name })
          .from(courses)
          .where(eq(courses.id, participant.courseId))
          .limit(1);

        return {
          ...participant,
          courseName: courseResult[0]?.name || null,
        };
      })
    );

    return participantsWithCourses;
  }),

  /**
   * Get pending validations count
   */
  getPendingValidations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tenantId = ctx.user!.tenantId;

    // @ts-expect-error Drizzle ORM 0.44.5 TypeScript issue with eq()
    const allDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId));

    const pending = allDocs.filter(doc => doc.validationStatus === "pending").length;
    const manualReview = allDocs.filter(doc => doc.validationStatus === "manual_review").length;

    return {
      pending,
      manualReview,
      total: pending + manualReview,
    };
  }),
});
