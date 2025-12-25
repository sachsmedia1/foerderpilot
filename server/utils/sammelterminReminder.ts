/**
 * FOERDERPILOT - SAMMELTERMIN REMINDER
 * 
 * Täglicher Cron-Job für Sammeltermin-Erinnerungen (1 Tag vorher)
 */

import { getDb } from '../db';
import { sammeltermins, participants, courses } from '../../drizzle/schema';
import { and, gte, lte, eq } from 'drizzle-orm';
import { sendSammelterminReminderNotification } from './emailNotifications';

/**
 * Send Sammeltermin Reminders for appointments in 24 hours
 */
export async function sendSammelterminReminders(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.error('[Sammeltermin-Reminder] Database not available');
    return 0;
  }

  try {
    // Calculate time range: 24 hours from now (+/- 1 hour buffer)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStart = new Date(tomorrow.getTime() - 60 * 60 * 1000); // -1 hour
    const tomorrowEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000); // +1 hour

    // Find all Sammeltermine in 24 hours
    const upcomingSammeltermine = await db
      .select()
      .from(sammeltermins)
      .where(
        and(
          gte(sammeltermins.date, tomorrowStart),
          lte(sammeltermins.date, tomorrowEnd)
        )
      );

    if (upcomingSammeltermine.length === 0) {
      console.log('[Sammeltermin-Reminder] No upcoming Sammeltermine found');
      return 0;
    }

    console.log(`[Sammeltermin-Reminder] Found ${upcomingSammeltermine.length} upcoming Sammeltermine`);

    let sentCount = 0;

    // For each Sammeltermin, find all participants and send reminders
    for (const sammeltermin of upcomingSammeltermine) {
      // Get course info
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, sammeltermin.courseId as any))
        .limit(1);

      if (!course) {
        console.error(`[Sammeltermin-Reminder] Course ${sammeltermin.courseId} not found`);
        continue;
      }

      // Find all participants for this course
      const courseParticipants = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.courseId, sammeltermin.courseId),
            eq(participants.tenantId, sammeltermin.tenantId)
          )
        );

      console.log(`[Sammeltermin-Reminder] Sending reminders to ${courseParticipants.length} participants for ${course.name}`);

      // Send reminder to each participant
      for (const participant of courseParticipants) {
        try {
          const success = await sendSammelterminReminderNotification(
            participant.id,
            sammeltermin.tenantId,
            sammeltermin.date,
            sammeltermin.zoomLink || 'Wird noch bekannt gegeben',
            course.name
          );

          if (success) {
            sentCount++;
          }
        } catch (error) {
          console.error(`[Sammeltermin-Reminder] Failed to send reminder to participant ${participant.id}:`, error);
        }
      }
    }

    console.log(`[Sammeltermin-Reminder] Sent ${sentCount} reminders`);
    return sentCount;
  } catch (error) {
    console.error('[Sammeltermin-Reminder] Failed to send reminders:', error);
    return 0;
  }
}

/**
 * Start Sammeltermin-Reminder Schedule (runs daily at 9 AM)
 */
export function startSammelterminReminderSchedule() {
  // Run immediately on startup (for testing)
  sendSammelterminReminders();

  // Schedule daily at 9 AM
  const scheduleDaily = () => {
    const now = new Date();
    const next9AM = new Date(now);
    next9AM.setHours(9, 0, 0, 0);

    // If it's past 9 AM today, schedule for tomorrow
    if (now.getHours() >= 9) {
      next9AM.setDate(next9AM.getDate() + 1);
    }

    const msUntil9AM = next9AM.getTime() - now.getTime();

    setTimeout(() => {
      sendSammelterminReminders();
      // Schedule next run (24 hours later)
      setInterval(() => {
        sendSammelterminReminders();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntil9AM);

    console.log(`[Sammeltermin-Reminder] Scheduled next run at ${next9AM.toLocaleString('de-DE')}`);
  };

  scheduleDaily();
}
