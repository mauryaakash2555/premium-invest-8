import { test, expect } from '@playwright/test';

test('Home: renders hero overlay without console errors', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/');

  // Hero overlay should render.
  await expect(page.getByRole('heading', { name: /Architect Your/i })).toBeVisible();

  // Rotating word line should show one of the cycling words.
  await expect(page.locator('h1', { hasText: /(Legacy|Prosperity|Fortune|Dynasty)/ })).toBeVisible();

  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});
