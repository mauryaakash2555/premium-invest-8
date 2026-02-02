// E2E: Learning must be separated from Live Intelligence overlay.
// Requirements:
// - Overlay: zero learning UI
// - /live-intelligence: summary + CTA only (no lessons)
// - /learn: full learning experience
// - localStorage keys unchanged: li_premium_learning_v2, li_quicklearn_state

const { test, expect } = require('@playwright/test');

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

function initProgressScript() {
  return () => {
    try {
      const dayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem(
        'li_premium_learning_v2',
        JSON.stringify({
          openKey: 'pl_beg_01_goals',
          completed: { pl_beg_01_goals: true },
          mode: 'path',
          updatedAt: new Date().toISOString(),
        })
      );
      localStorage.setItem(
        'li_quicklearn_state',
        JSON.stringify({
          [dayKey]: { revealed: { 0: true }, completed: { 0: true }, activeIdx: 0 },
        })
      );
    } catch {
      // ignore
    }
  };
}

test.describe('Learning separation & routing', () => {
  test('Overlay opener is removed (use /live-intelligence)', async ({ page }) => {
    await page.addInitScript(initProgressScript());

    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

    const hasGlobalOpener = await page
      .evaluate(() => typeof window.__openLiveIntelligence === 'function')
      .catch(() => false);
    expect(hasGlobalOpener).toBeFalsy();

    // Ensure overlay container is not present
    await expect(page.locator('.li-overlay')).toHaveCount(0);
  });

  test('/live-intelligence shows summary + CTA, no lessons', async ({ page }) => {
    await page.addInitScript(initProgressScript());

    await page.goto(`${BASE}/live-intelligence`, { waitUntil: 'domcontentloaded' });

    // Summary card should exist and include CTA (client-rendered)
    const summary = page.locator('[aria-label="Learning progress summary"]');
    await expect(summary).toBeVisible({ timeout: 15000 });
    await expect(summary.getByRole('link', { name: /open learning/i })).toHaveAttribute('href', '/learn');

    // Should reflect the stored progress
    await expect(page.getByText(/Progress:\s*1\//)).toBeVisible();
    await expect(page.getByText(/QuickLearn today:\s*1\/3/)).toBeVisible();

    // No full lesson UI
    await expect(page.locator('.lp-wrap')).toHaveCount(0);
    await expect(page.getByText('Learn in 2 ways')).toHaveCount(0);
  });

  test('/learn contains the full learning experience', async ({ page }) => {
    await page.addInitScript(initProgressScript());

    await page.goto(`${BASE}/learn`, { waitUntil: 'domcontentloaded' });

    // The learning panel is client-rendered; allow hydration.
    await page.waitForTimeout(800);

    await expect(page.locator('.lp-wrap')).toBeVisible();

    // Sanity: the exact keys must still exist in localStorage
    const keys = await page.evaluate(() => ({
      premium: localStorage.getItem('li_premium_learning_v2'),
      quick: localStorage.getItem('li_quicklearn_state'),
    }));

    expect(typeof keys.premium === 'string' && keys.premium.length > 0).toBeTruthy();
    expect(typeof keys.quick === 'string' && keys.quick.length > 0).toBeTruthy();
  });
});
