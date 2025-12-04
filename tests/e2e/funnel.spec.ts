import { test, expect } from '@playwright/test';

test('Complete registration funnel flow', async ({ page }) => {
  // Navigate to funnel
  await page.goto('http://localhost:3000/anmeldung');
  
  // Wait for page to load
  await page.waitForSelector('h1');
  
  // Check if fördercheck form is visible
  const heading = await page.textContent('h1');
  console.log('Page heading:', heading);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/funnel_step1.png' });
  
  // Fill fördercheck form
  await page.click('input[id="wohnsitz-ja"]');
  await page.click('input[id="hauptberuflich-ja"]');
  await page.click('input[id="einkuenfte-ja"]');
  
  // Select mitarbeiter
  await page.click('button[role="combobox"]');
  await page.click('text=0 (Solo-Selbstständig)');
  
  // Fill date
  await page.fill('input[type="date"]', '2020-01-01');
  
  // Fill de-minimis
  await page.fill('input[type="number"]', '0');
  
  // Select KOMPASS schecks
  await page.click('button[role="combobox"]:nth-of-type(2)');
  await page.click('text=0 (Erstantrag)');
  
  // Submit
  await page.click('button:has-text("Förderfähigkeit prüfen")');
  
  // Wait for response
  await page.waitForTimeout(2000);
  
  // Take screenshot of result
  await page.screenshot({ path: '/tmp/funnel_after_submit.png' });
});
