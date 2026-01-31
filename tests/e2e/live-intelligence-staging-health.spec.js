import { test, expect } from '@playwright/test';

// This spec is meant to run against a remote deployment.
// Usage (example):
//   set BASE_URL=https://<deployment>.vercel.app
//   set PLAYWRIGHT_SKIP_WEB_SERVER=1
//   npx playwright test tests/e2e/live-intelligence-staging-health.spec.js

test('Live Intelligence page loads without client exception', async ({ page, baseURL }) => {
  const errors = [];

  page.on('pageerror', (err) => {
    errors.push(String(err?.message || err));
  });

  // Treat severe console errors as failures (common symptom of client exception).
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`console.error: ${msg.text()}`);
    }
  });

  await page.goto('/live-intelligence', { waitUntil: 'domcontentloaded' });

  // Give hydration a moment; many crashes surface here.
  await page.waitForTimeout(1200);

  // Common Next/Vercel crash banner text.
  await expect(page.getByText(/Application error: a client-side exception/i)).toHaveCount(0);

  // Assert we have some LI UI present.
  // (Keep this broad to avoid false failures across design tweaks.)
  await expect(
    page.getByRole('heading', { name: /Live Intelligence|Intelligence/i }).first()
  ).toBeVisible({ timeout: 15000 });

  // If we captured any runtime errors, fail with a helpful payload.
  expect(errors, `Client-side errors on ${baseURL}/live-intelligence:\n${errors.join('\n')}`).toEqual([]);
});
