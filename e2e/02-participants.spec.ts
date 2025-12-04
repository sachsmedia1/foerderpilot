/**
 * FOERDERPILOT - E2E TESTS: PARTICIPANTS
 * 
 * Tests:
 * - Dashboard → Teilnehmer-Anlage Flow
 * - Teilnehmer-Liste anzeigen
 * - Teilnehmer-Details anzeigen
 * - Teilnehmer-Status ändern
 */

import { test, expect } from '@playwright/test';

test.describe('Participants', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to participants list', async ({ page }) => {
    // Click "Teilnehmer" in navigation
    await page.click('a:has-text("Teilnehmer")');
    
    // Should navigate to participants page
    await expect(page).toHaveURL(/\/participants/);
    
    // Should show participants table or list
    await expect(page.locator('text=/teilnehmer|name|e-mail/i')).toBeVisible();
  });

  test('should create new participant', async ({ page }) => {
    await page.goto('/participants');
    
    // Click "Neuer Teilnehmer" or "Teilnehmer hinzufügen" button
    await page.click('button:has-text("Neu"), a:has-text("Neu")');
    
    // Should navigate to form
    await expect(page).toHaveURL(/\/participants\/new/);
    
    // Fill in form
    await page.fill('input[name="firstName"]', 'Max');
    await page.fill('input[name="lastName"]', 'Mustermann');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '+49 123 456789');
    
    // Select course (if dropdown exists)
    const courseSelect = page.locator('select[name="courseId"]');
    if (await courseSelect.isVisible()) {
      await courseSelect.selectOption({ index: 1 });
    }
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Speichern"), button[type="submit"]:has-text("Erstellen")');
    
    // Should redirect to participants list or detail page
    await expect(page).toHaveURL(/\/participants/);
    
    // Should show success message
    await expect(page.locator('text=/erfolgreich|gespeichert|erstellt/i')).toBeVisible({ timeout: 10000 });
  });

  test('should view participant details', async ({ page }) => {
    await page.goto('/participants');
    
    // Wait for table to load
    await page.waitForSelector('table, [data-testid="participant-list"]', { timeout: 10000 });
    
    // Click first participant (eye icon or name)
    const firstParticipant = page.locator('table tbody tr, [data-testid="participant-item"]').first();
    await firstParticipant.locator('a, button').first().click();
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/participants\/\d+|\/teilnehmer\/\d+/);
    
    // Should show participant details
    await expect(page.locator('text=/name|e-mail|status/i')).toBeVisible();
  });

  test('should update participant status', async ({ page }) => {
    await page.goto('/participants');
    
    // Wait for table to load
    await page.waitForSelector('table, [data-testid="participant-list"]', { timeout: 10000 });
    
    // Click first participant to view details
    const firstParticipant = page.locator('table tbody tr, [data-testid="participant-item"]').first();
    await firstParticipant.locator('a, button').first().click();
    
    await expect(page).toHaveURL(/\/participants\/\d+|\/teilnehmer\/\d+/);
    
    // Find status dropdown or buttons
    const statusSelect = page.locator('select:has-text("Status"), [data-testid="status-select"]');
    
    if (await statusSelect.isVisible()) {
      // Select new status
      await statusSelect.selectOption({ index: 1 });
      
      // Save if there's a save button
      const saveButton = page.locator('button:has-text("Speichern")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
      }
      
      // Should show success message
      await expect(page.locator('text=/erfolgreich|gespeichert|aktualisiert/i')).toBeVisible({ timeout: 10000 });
    }
  });
});
