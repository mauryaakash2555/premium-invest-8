const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

function initStabilityScript() {
  return () => {
    try {
      // Prevent one-time localhost reload scripts from racing Playwright.
      sessionStorage.setItem('__bmw_dev_hard_reload_v1', '1');
      sessionStorage.setItem('__bmw_sw_reset_done_v2:local', '1');
      sessionStorage.setItem('__bmw_sw_reset_done_v2:no-build', '1');
    } catch {
      // ignore
    }
  };
}

function readAllFilesRec(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readAllFilesRec(full));
    else out.push(full);
  }
  return out;
}

test.describe('/learn LearningKernel (ask-first, infinite, theme lock)', () => {
  test('Ask-only start (no visible buttons)', async ({ page }) => {
    await page.addInitScript(initStabilityScript());
    await page.goto(`${BASE}/learn`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-learn-ready="1"]')).toBeVisible({ timeout: 15000 });

    const ask = page.getByRole('textbox', { name: /what would you like to understand today/i });
    await expect(ask).toBeVisible({ timeout: 15000 });

    // Must not show visible buttons at the start.
    const learnRoot = page.locator('[data-learn-ready]');
    await expect(learnRoot.getByRole('button')).toHaveCount(0);
  });

  test('Topic integrity + infinite depth + style switch + back/forward', async ({ page }) => {
    await page.addInitScript(initStabilityScript());
    await page.goto(`${BASE}/learn`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-learn-ready="1"]')).toBeVisible({ timeout: 15000 });

    const ask = page.getByRole('textbox', { name: /what would you like to understand today/i });
    await ask.click();
    await ask.fill('sif');
    await ask.press('Enter');

    // Style chooser appears only after the ask.
    const optionButtons = page.locator('button.lk-opt');
    await expect(optionButtons.first()).toBeVisible({ timeout: 20000 });
    expect(await optionButtons.count()).toBeGreaterThanOrEqual(3);

    // Topic integrity check (must not become SIP).
    await expect(page.getByText(/^Topic:\s*sif$/)).toBeVisible({ timeout: 20000 });
    await optionButtons.first().click();

    // First slice appears.
    await expect(page.locator('text=One slice')).toBeVisible({ timeout: 20000 });

    const depthPill = page.getByText(/^Depth:\s*\d+$/);
    await expect(depthPill).toBeVisible();

    // Verify depth monotonically increases on repeated actions.
    const getDepth = async () => {
      const txt = await depthPill.textContent();
      const m = String(txt || '').match(/(\d+)/);
      return m ? Number(m[1]) : NaN;
    };

    let prev = await getDepth();
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: /go deeper/i }).click();
      await expect(page.locator('text=One slice')).toBeVisible({ timeout: 20000 });
      const next = await getDepth();
      expect(next).toBeGreaterThanOrEqual(prev);
      prev = next;
    }

    // Style switch works.
    await page.getByRole('button', { name: /switch style/i }).click();
    await expect(optionButtons.first()).toBeVisible({ timeout: 20000 });
    await optionButtons.nth(1).click();
    await expect(page.locator('text=One slice')).toBeVisible({ timeout: 20000 });

    // Back/Forward supported after multiple slices.
    const sliceBlock = page.locator('.lk-slice');
    const currentText = await sliceBlock.textContent();
    await page.getByRole('button', { name: /^back$/i }).click();
    const backText = await sliceBlock.textContent();
    expect(String(backText || '')).not.toEqual(String(currentText || ''));

    await page.getByRole('button', { name: /^forward$/i }).click();
    const forwardText = await sliceBlock.textContent();
    expect(String(forwardText || '')).toEqual(String(currentText || ''));
  });

  test('Theme lock: no hex colors or fixed MODES list in /learn code', async () => {
    const root = process.cwd();
    const learnDir = path.join(root, 'app', 'learn');
    const files = readAllFilesRec(learnDir);

    const hexRe = /#([0-9a-fA-F]{3,8})\b/;
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (!['.js', '.jsx', '.ts', '.tsx', '.css'].includes(ext)) continue;
      const txt = fs.readFileSync(f, 'utf8');
      expect(hexRe.test(txt)).toBeFalsy();
      expect(txt.includes('const MODES')).toBeFalsy();
    }
  });
});
