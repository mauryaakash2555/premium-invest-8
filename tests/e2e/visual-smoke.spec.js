const { test, expect } = require('@playwright/test');

async function gotoAndSettle(page, path, waitForSelector) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });

  // Reduce flake from animations/transitions.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
    `,
  });

  if (waitForSelector) {
    await expect(page.locator(waitForSelector).first()).toBeVisible({ timeout: 20000 });
  } else {
    await page.waitForTimeout(750);
  }

  // Give client-side enhancements a moment to render.
  await page.waitForTimeout(750);
}

test.describe('Visual smoke screenshots', () => {
  test('captures key pages', async ({ page }, testInfo) => {
    // Home
    await gotoAndSettle(page, '/', 'body');
    await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });

    // Blog index
    await gotoAndSettle(page, '/blog', 'main');
    await page.screenshot({ path: testInfo.outputPath('blog-index.png'), fullPage: true });

    // Blog detail (has Next Read + WhatsApp CTA in this codebase)
    await gotoAndSettle(page, '/blog/best-credit-cards-high-income-india', 'main');
    await page.screenshot({ path: testInfo.outputPath('blog-detail.png'), fullPage: true });

    // Live Intelligence overlay page
    await gotoAndSettle(page, '/live-intelligence', 'main');
    await page.screenshot({ path: testInfo.outputPath('live-intelligence.png'), fullPage: true });

    // SIP vs Panic tool page (share card + preview)
    await gotoAndSettle(page, '/intelligence/sip-vs-panic', 'main');
    await page.screenshot({ path: testInfo.outputPath('sip-vs-panic.png'), fullPage: true });
  });
});
