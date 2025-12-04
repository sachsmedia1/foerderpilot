import { defineConfig, devices } from '@playwright/test';

/**
 * FOERDERPILOT - PLAYWRIGHT E2E TEST CONFIGURATION
 * 
 * Tests kritische User-Flows:
 * - Login → Dashboard → Teilnehmer-Anlage
 * - Dokument-Upload → AI-Validation → Approval
 * - Kanban Drag & Drop
 * - Passwort-Reset
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
