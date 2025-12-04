/**
 * FOERDERPILOT - E2E TESTS: AUTHENTICATION
 * 
 * Tests:
 * - Login Flow (E-Mail + Passwort)
 * - Logout
 * - Passwort-Reset Flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show user name or email in header
    await expect(page.locator('text=/test@example.com|Dashboard/i')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
    
    // Should show error message
    await expect(page.locator('text=/fehler|ungültig|falsch/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Click logout button
    await page.click('button:has-text("Abmelden"), button:has-text("Logout")');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login');
    
    // Click "Passwort vergessen" link
    await page.click('a:has-text("Passwort vergessen")');
    
    // Should navigate to forgot-password page
    await expect(page).toHaveURL(/\/forgot-password/);
    
    // Should show email input
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should request password reset', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=/e-mail.*gesendet|erfolgreich/i')).toBeVisible();
  });
});
