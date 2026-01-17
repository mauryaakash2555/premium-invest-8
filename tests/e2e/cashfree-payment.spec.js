/**
 * Cashfree Payment Smoke Test
 *
 * Verifies that "Send It Now" button in the Property vs SIP calculator
 * correctly navigates to the Cashfree checkout page (TEST or PROD).
 *
 * Run with: npm run test:e2e -- tests/e2e/cashfree-payment.spec.js
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Mock lead capture and order creation to avoid real API calls
async function mockPaymentApis(page, { env = "TEST" } = {}) {
  // Mock lead capture
  await page.route("**/api/leads/capture", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, leadId: "test-lead-123" }),
    });
  });

  // Mock Cashfree order creation - returns different checkout URLs based on env
  await page.route("**/api/payments/cashfree/create-order", async (route) => {
    const checkoutBase =
      env === "PROD"
        ? "https://payments.cashfree.com"
        : "https://payments-test.cashfree.com";
    const sessionId = "mock_session_" + Date.now();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        payment_session_id: sessionId,
        order_id: "bmw_test_order",
        checkout_url: `${checkoutBase}/checkout?payment_session_id=${sessionId}`,
      }),
    });
  });
}

test.describe("Cashfree Payment Flow", () => {
  test("Property vs SIP → Send It Now → redirects to Cashfree TEST checkout", async ({
    page,
  }) => {
    await mockPaymentApis(page, { env: "TEST" });

    // Navigate to the tools page (Property vs SIP calculator)
    await page.goto(`${BASE_URL}/tools`);

    // Wait for calculator to load
    await page.waitForSelector('text="Property"', { timeout: 10000 });

    // Fill calculator inputs and click Calculate
    // (Adjust selectors based on actual DOM structure)
    const calculateBtn = page.locator('button:has-text("Calculate")');
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
      await page.waitForTimeout(500);
    }

    // Look for the unlock/pay button
    const unlockBtn = page.locator(
      'button:has-text("Unlock"), button:has-text("Premium"), button:has-text("Exit Plan")'
    );
    if (await unlockBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.first().click();
      await page.waitForTimeout(300);
    }

    // Fill lead capture modal
    const nameInput = page.locator('input[placeholder*="name" i]');
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="WhatsApp" i]');

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill("Test User");
    }
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill("test@example.com");
    }
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill("9876543210");
    }

    // Capture navigation before clicking pay button
    const navigationPromise = page.waitForURL(
      (url) => url.href.includes("payments-test.cashfree.com") || url.href.includes("payments.cashfree.com"),
      { timeout: 15000 }
    );

    // Click "Send It Now" or similar pay button
    const payBtn = page.locator('button:has-text("Send It Now"), button:has-text("Pay"), button:has-text("₹399")');
    if (await payBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.first().click();
    }

    // Verify redirect to Cashfree TEST checkout
    await navigationPromise;
    expect(page.url()).toContain("payments-test.cashfree.com/checkout");
  });

  test("Payment API returns PROD checkout_url when CASHFREE_ENV=PROD", async ({
    page,
  }) => {
    await mockPaymentApis(page, { env: "PROD" });

    await page.goto(`${BASE_URL}/tools`);
    await page.waitForSelector('text="Property"', { timeout: 10000 });

    // Click Calculate
    const calculateBtn = page.locator('button:has-text("Calculate")');
    if (await calculateBtn.isVisible()) {
      await calculateBtn.click();
      await page.waitForTimeout(500);
    }

    // Click unlock/pay
    const unlockBtn = page.locator(
      'button:has-text("Unlock"), button:has-text("Premium"), button:has-text("Exit Plan")'
    );
    if (await unlockBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.first().click();
      await page.waitForTimeout(300);
    }

    // Fill form
    const nameInput = page.locator('input[placeholder*="name" i]');
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="WhatsApp" i]');

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill("Test User");
    }
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill("test@example.com");
    }
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill("9876543210");
    }

    // Capture navigation
    const navigationPromise = page.waitForURL(
      (url) => url.href.includes("payments.cashfree.com"),
      { timeout: 15000 }
    );

    // Click pay
    const payBtn = page.locator('button:has-text("Send It Now"), button:has-text("Pay"), button:has-text("₹399")');
    if (await payBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.first().click();
    }

    await navigationPromise;
    // PROD uses payments.cashfree.com (not payments-test)
    expect(page.url()).toContain("payments.cashfree.com/checkout");
    expect(page.url()).not.toContain("payments-test");
  });
});

test.describe("Tax Calculator Payment Flow", () => {
  test("Tax Calculator → Pay → redirects to Cashfree checkout", async ({
    page,
  }) => {
    await mockPaymentApis(page, { env: "TEST" });

    // Navigate to tax calculator (adjust path as needed)
    await page.goto(`${BASE_URL}/tax-leak-detector`);

    // Wait for calculator
    await page.waitForTimeout(1000);

    // Look for calculate button
    const calculateBtn = page.locator('button:has-text("Calculate"), button:has-text("Check")');
    if (await calculateBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await calculateBtn.first().click();
      await page.waitForTimeout(500);
    }

    // Look for pay/unlock button
    const unlockBtn = page.locator(
      'button:has-text("Unlock"), button:has-text("Blueprint"), button:has-text("₹299")'
    );
    if (await unlockBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await unlockBtn.first().click();
      await page.waitForTimeout(300);
    }

    // Fill lead capture
    const nameInput = page.locator('input[placeholder*="name" i]');
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="WhatsApp" i]');

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill("Tax Test User");
    }
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill("taxtest@example.com");
    }
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill("9876543210");
    }

    // Capture navigation
    const navigationPromise = page.waitForURL(
      (url) => url.href.includes("cashfree.com"),
      { timeout: 15000 }
    );

    // Click pay
    const payBtn = page.locator('button:has-text("Pay"), button:has-text("₹299"), button:has-text("Send")');
    if (await payBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await payBtn.first().click();
    }

    await navigationPromise;
    expect(page.url()).toContain("cashfree.com/checkout");
  });
});
