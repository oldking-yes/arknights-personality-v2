import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:4173/arknights-personality-v2/';

test('Intro screen - design spec validation', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await expect(page).toHaveScreenshot('intro.png', { maxDiffPixelRatio: 0.02 });
});

test('Quiz screen - first question', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('button').first().click();
  await page.waitForTimeout(1500);
  await expect(page).toHaveScreenshot('quiz.png', { maxDiffPixelRatio: 0.02 });
});

test('Results screen - operator match', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('button').nth(1).click();
  await page.waitForTimeout(3000);
  await expect(page).toHaveScreenshot('results.png', { maxDiffPixelRatio: 0.02 });
});
