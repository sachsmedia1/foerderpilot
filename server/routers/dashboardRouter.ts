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
    // @ts-ignore - Drizzle ORM type issue
    const allParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.tenantId, tenantId));
    
    const participantCount = allParticipants.length;

    // Kurse-Count
    // @ts-ignore - Drizzle ORM type issue
    const allCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.tenantId, tenantId));
    
    const courseCount = allCourses.length;

    // Sammeltermine-Count
    // @ts-ignore - Drizzle ORM type issue
    const allSammeltermins = await db
      .select()
      .from(sammeltermins)
      .where(eq(sammeltermins.tenantId, tenantId));
    
    const sammelterminCount = allSammeltermins.length;

    // Dokument-Validation-Rate
    // @ts-ignore - Drizzle ORM type issue
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

    // @ts-ignore - Drizzle ORM type issue
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

  /**
   * Get chart data for Admin Dashboard
   */
  getChartData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const tenantId = ctx.user!.tenantId;

    // Chart 1: Anmeldungen pro Woche (letzten 8 Wochen)
    // @ts-ignore - Drizzle ORM type issue
    const allParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.tenantId, tenantId));

    const now = new Date();
    const weeklySignups = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const count = allParticipants.filter(p => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= weekStart && createdAt < weekEnd;
      }).length;
      
      // Format: "KW 48" oder "12. Nov"
      const weekLabel = `${weekStart.getDate()}. ${weekStart.toLocaleDateString('de-DE', { month: 'short' })}`;
      weeklySignups.push({ week: weekLabel, count });
    }

    // Chart 2: Dokument-Validierungs-Status (Pie Chart)
    // @ts-ignore - Drizzle ORM type issue
    const allDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.tenantId, tenantId));

    const validationStatusMap = new Map<string, number>();
    allDocs.forEach(doc => {
      const status = doc.validationStatus || 'pending';
      const current = validationStatusMap.get(status) || 0;
      validationStatusMap.set(status, current + 1);
    });

    const validationStatusDistribution = Array.from(validationStatusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // Chart 3: Top 3 Kurse (nach Teilnehmer-Anzahl)
    // @ts-ignore - Drizzle ORM type issue
    const allCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.tenantId, tenantId));

    const coursesWithParticipants = allCourses.map(course => {
      const participantCount = allParticipants.filter(p => p.courseId === course.id).length;
      return {
        courseName: course.name,
        participantCount,
      };
    });

    const topCourses = coursesWithParticipants
      .sort((a, b) => b.participantCount - a.participantCount)
      .slice(0, 3);

    return {
      weeklySignups,
      validationStatusDistribution,
      topCourses,
    };
  }),
});
