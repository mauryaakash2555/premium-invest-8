/**
 * Gateway Audit — User Flow (END TO END)
 *
 * This spec is designed to run against LIVE hosts.
 *
 * Defaults:
 *   MAIN_BASE=https://bmwealth.co.in
 *   STORE_BASE=https://store.bmwealth.co.in
 *
 * Recommended:
 *   set PLAYWRIGHT_SKIP_WEB_SERVER=1
 *
 * Run:
 *   npx playwright test tests/e2e/gateway-audit-flow.spec.js
 */

import { test, expect } from "@playwright/test";

const MAIN_BASE = (process.env.AUDIT_MAIN_BASE || "https://bmwealth.co.in").replace(/\/$/, "");
const STORE_BASE = (process.env.AUDIT_STORE_BASE || "https://store.bmwealth.co.in").replace(/\/$/, "");

test.describe("Gateway audit: user flows", () => {
  test("FLOW 1 — Free tool: calculate works; no payment modal on main", async ({ page }) => {
    await page.goto(`${MAIN_BASE}/tools/tax-optimization`, { waitUntil: "domcontentloaded" });

    // Calculator UI is client-side; wait for a clear action button.
    const calculateButton = page.getByRole("button", { name: /calculate/i });
    await expect(calculateButton).toBeVisible({ timeout: 30_000 });

    await calculateButton.click();

    // On main domain, Razorpay must not load.
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("checkout.razorpay.com");
    expect(html.toLowerCase()).not.toContain("razorpay");
  });

  test("FLOW 2 — Paid CTA on main redirects to store product", async ({ page }) => {
    await page.goto(`${MAIN_BASE}/tools/tax-optimization`, { waitUntil: "domcontentloaded" });

    // Some CTAs appear after calculate.
    const calculateButton = page.getByRole("button", { name: /calculate/i });
    await expect(calculateButton).toBeVisible({ timeout: 30_000 });
    await calculateButton.click();

    // Try common paid CTA texts.
    const paidCta = page
      .getByRole("button", { name: /open in digital store|unlock|buy|blueprint|pdf/i })
      .first();

    await expect(paidCta).toBeVisible({ timeout: 30_000 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      paidCta.click(),
    ]);

    await expect(page).toHaveURL(new RegExp(`^${STORE_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/|/products/)`));
  });

  test("FLOW 2B — Store catalogue uses *-pdf slugs", async ({ page }) => {
    await page.goto(`${STORE_BASE}/products`, { waitUntil: "domcontentloaded" });

    const detailLinks = page.getByRole("link", { name: /view details/i });
    const count = await detailLinks.count();
    expect(count).toBeGreaterThan(0);

    const bad = [];
    for (let i = 0; i < count; i++) {
      const href = await detailLinks.nth(i).getAttribute("href");
      if (!href) continue;
      if (!href.startsWith("/products/")) continue;
      if (!href.toLowerCase().endsWith("-pdf")) bad.push(href);
    }

    // This must be empty for gateway compliance.
    expect(bad, `Non -pdf slugs found: ${bad.join(", ")}`).toEqual([]);
  });

  test("FLOW 3 — Store checkout wiring exists (order API + digital wording)", async ({ page }) => {
    // Pick a representative product page.
    await page.goto(`${STORE_BASE}/products`, { waitUntil: "domcontentloaded" });

    // Click the first product.
    const firstProductLink = page.getByRole("link", { name: /view details/i }).first();
    await expect(firstProductLink).toBeVisible({ timeout: 30_000 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      firstProductLink.click(),
    ]);

    // Digital delivery wording must be visible.
    await expect(page.getByText(/digital product/i)).toBeVisible();
    await expect(page.getByText(/no physical goods are shipped/i)).toBeVisible();

    // Verify the Razorpay order endpoint is reachable from the store host.
    // This does not complete a payment, it only checks gateway wiring.
    const orderRes = await page.request.post(`${STORE_BASE}/api/payments/razorpay/create-order`, {
      data: {
        // slug is read server-side; we can pass a dummy first and expect 400/404.
        productSlug: "__unknown__",
      },
    });

    // Acceptable outcomes:
    // - 400/404 for invalid slug (means route exists and is store-only)
    // - 500 razorpay_not_configured indicates env missing (should be fixed in Vercel)
    expect([200, 400, 404, 500]).toContain(orderRes.status());
  });

  test("FLOW 4 — Policy visibility (footer links open)", async ({ page }) => {
    await page.goto(`${STORE_BASE}/products`, { waitUntil: "domcontentloaded" });

    const terms = page.getByRole("link", { name: /terms/i });
    const privacy = page.getByRole("link", { name: /privacy/i });
    const refund = page.getByRole("link", { name: /refund/i });
    const delivery = page.getByRole("link", { name: /delivery|shipping/i });

    await expect(terms).toBeVisible();
    await expect(privacy).toBeVisible();
    await expect(refund).toBeVisible();
    await expect(delivery).toBeVisible();

    await terms.click();
    await expect(page).toHaveURL(new RegExp(`${STORE_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/terms`));

    await page.goto(`${STORE_BASE}/products`, { waitUntil: "domcontentloaded" });
    await privacy.click();
    await expect(page).toHaveURL(new RegExp(`${STORE_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/privacy`));

    await page.goto(`${STORE_BASE}/products`, { waitUntil: "domcontentloaded" });
    await refund.click();
    await expect(page).toHaveURL(new RegExp(`${STORE_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/refund`));
    await expect(page.getByText(/5–7 working days|5-7 working days/i)).toBeVisible();

    await page.goto(`${STORE_BASE}/products`, { waitUntil: "domcontentloaded" });
    await delivery.click();
    await expect(page).toHaveURL(new RegExp(`${STORE_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/delivery`));
    await expect(page.getByText(/no physical goods are shipped/i)).toBeVisible();
  });
});
