/**
 * Store-only Payments Compliance Smoke Test
 *
 * Verifies that premium CTAs on bmwealth.co.in open the Digital Store
 * (store.bmwealth.co.in) and that the payment order API is disabled on
 * non-store hosts.
 *
 * Run with: npm run test:e2e -- tests/e2e/cashfree-payment.spec.js
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("Digital Store redirects", () => {
  test("Property vs SIP premium CTA opens store product page", async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/property-vs-sip`);
    await page.waitForSelector('button:has-text("Calculate")', { timeout: 10000 });

    const calculateBtn = page.locator('button:has-text("Calculate")');
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
      await page.waitForTimeout(600);
    }

    const storeLink = page.locator('a:has-text("Open in Digital Store")').first();
    await expect(storeLink).toBeVisible({ timeout: 10000 });

    const popupPromise = page.waitForEvent("popup");
    await storeLink.click();
    const popup = await popupPromise;

    expect(popup.url()).toContain("https://store.bmwealth.co.in/products/property-vs-sip-premium-report");
  });

  test("Tax Leak Detector premium CTA opens store product page", async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/tax-leak-detector`);
    await page.waitForSelector('button:has-text("Calculate"), button:has-text("Check")', { timeout: 10000 });

    const calculateBtn = page.locator('button:has-text("Calculate"), button:has-text("Check")').first();
    await calculateBtn.click();
    await page.waitForTimeout(600);

    const storeLink = page.locator('a:has-text("Open in Digital Store")').first();
    await expect(storeLink).toBeVisible({ timeout: 10000 });

    const popupPromise = page.waitForEvent("popup");
    await storeLink.click();
    const popup = await popupPromise;

    expect(popup.url()).toContain("https://store.bmwealth.co.in/products/tax-optimization-blueprint");
  });
});

test.describe("Payment API compliance", () => {
  test("Cashfree create-order is disabled on non-store hosts", async ({ page }) => {
    const res = await page.request.post(`${BASE_URL}/api/payments/cashfree/create-order`, {
      data: { amount: 299, productName: "Test" },
    });

    expect(res.status()).toBe(404);
    const json = await res.json();
    expect(json?.error).toBe("payments_disabled_on_main_site");
  });
});
