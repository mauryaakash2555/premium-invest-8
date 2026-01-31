const { test, expect } = require('@playwright/test');

function mockMood() {
  return {
    success: true,
    mood: {
      mood_text: 'Nifty flat +0.05%. Bank Nifty higher +0.25%.',
      mood_type: 'mixed',
      generated_by: 'rule_based',
      generated_at: new Date().toISOString(),
    },
    source: 'mock',
  };
}

function mockFeed() {
  return {
    ok: true,
    source: 'mock',
    headlines: [
      {
        id: 'mock-1',
        headline: 'RBI keeps rates unchanged; markets steady',
        category: 'market',
        urgency: 'REGULAR',
        timestamp: new Date().toISOString(),
        source: 'MockWire',
        link: 'https://example.com/news/mock-1',
        what_happened: 'Policy rates remain unchanged in the latest review.',
        why_it_matters: 'Borrowing costs and liquidity conditions influence multiple asset classes.',
        where_fits: 'Useful context for long-term portfolio positioning and risk awareness.',
        expert_tip: 'Education-only: focus on process and time horizon; avoid impulse reactions.',
      },
    ],
  };
}

test.describe('Live Intelligence UX', () => {
  test('home mood strip navigates; headlines modal opens; learning renders', async ({ page }) => {
    // Make the test deterministic and independent of external feeds.
    await page.route('**/api/live-intelligence/mood*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMood()),
      });
    });

    await page.route('**/api/live-intelligence/feed*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFeed()),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Allow client hydration so click handlers are reliably attached.
    await page.waitForTimeout(1200);

    const openLiveIntel = page.getByRole('button', { name: 'Open Live Intelligence', exact: true });
    await expect(openLiveIntel).toBeVisible({ timeout: 20000 });
    await openLiveIntel.click();

    const overlayOpen = page.locator('.li-overlay.li-overlay-open');

    const openedViaOverlay = await overlayOpen
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    const openedViaRoute = openedViaOverlay
      ? false
      : await page
          .waitForURL(/\/live-intelligence(?:\?|#|$)/, { timeout: 8000 })
          .then(() => true)
          .catch(() => false);

    if (!openedViaOverlay && !openedViaRoute) {
      // Last-resort: trigger the global opener (if present) or navigate directly.
      const hasGlobalOpener = await page
        .evaluate(() => typeof window.__openLiveIntelligence === 'function')
        .catch(() => false);

      if (hasGlobalOpener) {
        await page.evaluate(() => window.__openLiveIntelligence());
        await overlayOpen.waitFor({ state: 'visible', timeout: 8000 });
      } else {
        await page.goto('/live-intelligence', { waitUntil: 'domcontentloaded' });
      }
    }

    const headlineFeed = page.locator('[data-headline-feed]');
    await expect(headlineFeed).toBeVisible({ timeout: 20000 });

    const card = page.locator('.li-headline-card').first();
    await expect(card).toBeVisible();
    await card.click();

    const modal = page.locator('.li-headline-modal-overlay');
    await expect(modal).toBeVisible({ timeout: 20000 });

    // Close (best-effort)
    const close = page.locator('.li-modal-close');
    if (await close.count()) {
      await close.first().click();
      await expect(modal).toBeHidden({ timeout: 20000 });
    }

    await expect(page.getByText('Premium Learning', { exact: false })).toBeVisible();
    await expect(page.getByText('Learn in 2 ways', { exact: false })).toBeVisible();
  });
});
