/**
 * FOERDERPILOT - CLEANUP EXPIRED TOKENS
 * 
 * Utility zum Löschen abgelaufener Password-Reset-Tokens
 */

import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { and, isNotNull, lt } from 'drizzle-orm';

/**
 * Lösche alle abgelaufenen Password-Reset-Tokens
 * 
 * Sollte regelmäßig ausgeführt werden (z.B. täglich via Cron)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.error('[Cleanup] Database not available');
    return 0;
  }

  try {
    const now = new Date();
    
    // Finde alle User mit abgelaufenen Tokens
    const expiredUsers = await db
      .select()
      .from(users)
      .where(
        and(
          isNotNull(users.resetToken),
          isNotNull(users.resetTokenExpiry),
          lt(users.resetTokenExpiry, now)
        )
      );

    if (expiredUsers.length === 0) {
      console.log('[Cleanup] No expired tokens found');
      return 0;
    }

    // Lösche abgelaufene Tokens
    for (const user of expiredUsers) {
      await db
        .update(users)
        .set({
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(and(
          isNotNull(users.resetToken),
          isNotNull(users.resetTokenExpiry),
          lt(users.resetTokenExpiry, now)
        ));
    }

    console.log(`[Cleanup] Deleted ${expiredUsers.length} expired tokens`);
    return expiredUsers.length;
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup expired tokens:', error);
    return 0;
  }
}

/**
 * Starte automatisches Cleanup (läuft alle 24 Stunden)
 */
export function startTokenCleanupSchedule() {
  // Initial cleanup
  cleanupExpiredTokens();

  // Schedule cleanup alle 24 Stunden
  setInterval(() => {
    cleanupExpiredTokens();
  }, 24 * 60 * 60 * 1000); // 24 Stunden

  console.log('[Cleanup] Token cleanup schedule started (runs every 24 hours)');
}
