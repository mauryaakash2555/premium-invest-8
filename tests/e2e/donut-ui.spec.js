const { test, expect } = require('@playwright/test');

test('Live Intelligence donut renders (screenshot)', async ({ page }) => {
  // This route is expected to contain the panel with the donut.
  await page.goto('/live-intelligence', { waitUntil: 'domcontentloaded' });

  const donut = page.locator('.li-donut-container').first();
  await expect(donut).toBeVisible({ timeout: 30_000 });

  // Ensure the donut has a square box (basic geometry sanity).
  const box = await donut.boundingBox();
  expect(box).toBeTruthy();
  if (box) {
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(2);
  }

  await donut.screenshot({ path: 'test-results/donut-ui.png' });
  await page.screenshot({ path: 'test-results/donut-ui-full.png', fullPage: true });
});
