import { test, expect } from '@playwright/test';

test('Floating chat trigger opens chat modal', async ({ page, baseURL }) => {
  const errors = [];

  page.on('pageerror', (err) => errors.push(String(err?.message || err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const trigger = page.getByRole('button', { name: 'Open chat', exact: true });

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
