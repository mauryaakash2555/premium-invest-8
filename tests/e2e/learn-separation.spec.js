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
      // Prevent the pre-hydration SW/cache reset script from triggering a one-time reload on localhost.
      // That reload can race Playwright interactions and leave the ask form in a reset state.
      try {
        sessionStorage.setItem('__bmw_dev_hard_reload_v1', '1');
        sessionStorage.setItem('__bmw_sw_reset_done_v2:local', '1');
        sessionStorage.setItem('__bmw_sw_reset_done_v2:no-build', '1');
      } catch {
        // ignore
      }

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

  test('/live-intelligence shows no learning UI', async ({ page }) => {
    await page.addInitScript(initProgressScript());

    await page.goto(`${BASE}/live-intelligence`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[aria-label="Learning progress summary"]')).toHaveCount(0);
    await expect(page.locator('.lp-wrap')).toHaveCount(0);
  });

  test('/learn contains the full learning experience', async ({ page }) => {
    await page.addInitScript(initProgressScript());

    await page.goto(`${BASE}/learn`, { waitUntil: 'domcontentloaded' });

    // /learn must start ask-only (no legacy engine UI)
    const ask = page.getByRole('textbox', { name: /what would you like to understand today/i });
    await expect(ask).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.lp-wrap')).toHaveCount(0);
    await expect(page.getByText('Learn in 2 ways')).toHaveCount(0);

    // Enter ANY topic (no topic whitelist)
    await ask.click();
    await ask.press('Control+A');
    await page.keyboard.type('covered call strategy for indian equities', { delay: 5 });

    await ask.press('Enter');

    // Style chooser appears only after the ask
    await expect(page.getByText(/pick a style/i)).toBeVisible({ timeout: 20000 });

    // Pick any style and verify we render content
    await page.locator('button.lk-opt').first().click();
    await expect(page.locator('text=One slice').first()).toBeVisible({ timeout: 20000 });
  });
});
