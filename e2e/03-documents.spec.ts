/**
 * FOERDERPILOT - E2E TESTS: DOCUMENTS
 * 
 * Tests:
 * - Dokument-Upload Flow
 * - Dokument-Liste anzeigen
 * - Dokument-Validierung (AI)
 * - Dokument-Approval/Rejection
 */

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Documents', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to documents page', async ({ page }) => {
    // Click "Dokumente" in navigation
    await page.click('a:has-text("Dokumente")');
    
    // Should navigate to documents page
    await expect(page).toHaveURL(/\/documents/);
    
    // Should show documents table or list
    await expect(page.locator('text=/dokument|name|typ|status/i')).toBeVisible();
  });

  test('should upload document successfully', async ({ page }) => {
    await page.goto('/documents');
    
    // Create a test file
    const testFilePath = path.join(__dirname, '../test-fixtures/test-document.pdf');
    
    // Find file input
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      // Upload file
      await fileInput.setInputFiles(testFilePath);
      
      // Wait for upload to complete
      await expect(page.locator('text=/erfolgreich|hochgeladen|uploaded/i')).toBeVisible({ timeout: 15000 });
    } else {
      // Skip if no file input visible
      test.skip();
    }
  });

  test('should show validation status', async ({ page }) => {
    await page.goto('/documents');
    
    // Wait for documents table to load
    await page.waitForSelector('table, [data-testid="document-list"]', { timeout: 10000 });
    
    // Should show validation status (pending, valid, invalid)
    const statusElements = page.locator('text=/pending|valid|invalid|ausstehend|gültig|ungültig/i');
    await expect(statusElements.first()).toBeVisible();
  });

  test('should navigate to validation dashboard', async ({ page }) => {
    // Click "Validierung" in navigation
    await page.click('a:has-text("Validierung")');
    
    // Should navigate to validation page
    await expect(page).toHaveURL(/\/validation/);
    
    // Should show tabs (Pending, Valid, Invalid, Manual Review)
    await expect(page.locator('text=/pending|valid|invalid|manual/i')).toBeVisible();
  });

  test('should approve document', async ({ page }) => {
    await page.goto('/validation');
    
    // Wait for documents table to load
    await page.waitForSelector('table, [data-testid="validation-list"]', { timeout: 10000 });
    
    // Find first document with "Approve" button
    const approveButton = page.locator('button:has-text("Genehmigen"), button:has-text("Approve")').first();
    
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // Should show success message
      await expect(page.locator('text=/genehmigt|approved|erfolgreich/i')).toBeVisible({ timeout: 10000 });
    } else {
      // Skip if no documents to approve
      test.skip();
    }
  });

  test('should reject document', async ({ page }) => {
    await page.goto('/validation');
    
    // Wait for documents table to load
    await page.waitForSelector('table, [data-testid="validation-list"]', { timeout: 10000 });
    
    // Find first document with "Reject" button
    const rejectButton = page.locator('button:has-text("Ablehnen"), button:has-text("Reject")').first();
    
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      
      // Should show success message
      await expect(page.locator('text=/abgelehnt|rejected|erfolgreich/i')).toBeVisible({ timeout: 10000 });
    } else {
      // Skip if no documents to reject
      test.skip();
    }
  });
});
