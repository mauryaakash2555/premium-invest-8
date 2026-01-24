const { test, expect } = require('@playwright/test');

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('Blog 11 affiliate links render as premium exec cards', async ({ page }) => {
  const url = process.env.BLOG11_URL ||
    'https://stagingpremium-invest-8-cvystig7y-akashs-projects-7840bca9.vercel.app/blog/best-credit-cards-high-income-india';

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // The blog content and enhancements are client-rendered; give it time.
  await page.waitForTimeout(1500);

  // Expect at least one enhanced execution card.
  const cards = page.locator('.bm-exec-card');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });

  // Expect the button copy.
  await expect(page.locator('.bm-exec-card-button', { hasText: 'CHECK ELIGIBILITY' }).first()).toBeVisible();

  // Verify the button is actually clickable and opens a new tab to the outbound URL.
  const firstBtn = page.locator('.bm-exec-card-button', { hasText: 'CHECK ELIGIBILITY' }).first();
  const [popup] = await Promise.all([
    page.waitForEvent('popup', { timeout: 15000 }),
    firstBtn.click({ timeout: 15000 }),
  ]);
  await popup.waitForLoadState('domcontentloaded');

  // The affiliate link may briefly hit an intermediate tracking domain and then redirect to the
  // final bank/offer domain. Treat any external http(s) URL as success.
  const baseHost = new URL(url).host;
  await expect(popup).toHaveURL(/^https?:\/\//);
  const popupUrl = popup.url();
  expect(popupUrl).not.toMatch(new RegExp(`^https?:\\/\\/${escapeRegExp(baseHost)}(\\/|$)`));
  await popup.close();

  // Raw tracking URL should not be visible as the main link text.
  await expect(page.locator('text=linksredirect.com').first()).toHaveCount(0);
});
