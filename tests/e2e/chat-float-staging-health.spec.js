import { test, expect } from '@playwright/test';

test('Floating chat trigger opens chat modal', async ({ page, baseURL }) => {
  const errors = [];

  page.on('pageerror', (err) => errors.push(String(err?.message || err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  // Bypass the localhost SW/cache reset auto-reload (it can race the test and keep the UI unhydrated).
  await page.goto('/?__swResetDone=1', { waitUntil: 'domcontentloaded' });

  const trigger = page.locator('[aria-label="Open chat"]').first();

  // If the Spline/3D trigger renders as role=button, we can click it even if 3D isn't loaded.
  await expect(trigger).toBeVisible({ timeout: 20000 });
  await trigger.click({ timeout: 15000 });

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 15000 });

  // Close to ensure it is interactive.
  await page.getByRole('button', { name: 'Close' }).first().click();
  await expect(dialog).toHaveCount(0);

  expect(errors, `Client-side errors on ${baseURL}/ (chat open):\n${errors.join('\n')}`).toEqual([]);
});
