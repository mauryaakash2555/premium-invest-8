import { test, expect } from "@playwright/test";

test("SIP vs Panic: loads canonical page without console errors", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  // This route is a client component; wait for interactive UI.
  await page.goto("/intelligence/sip-vs-panic", { waitUntil: "networkidle" });

  // Primary simulator action should be visible.
  await expect(page.getByRole("button", { name: /Run(\s+Simulation|\s*\(Save\s*&\s*Share\))?/i })).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByRole("heading", { name: /What Happens If You Stop SIP During a Market Crash\?/i })
  ).toBeVisible();

  // Core CTA surface should exist.
  await expect(page.getByRole("button", { name: /Share.*WhatsApp/i })).toBeVisible();

  // JSON-LD should be present in the rendered HTML.
  const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
  expect(jsonLdCount).toBeGreaterThan(0);

  expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
});

test("SIP vs Panic: short horizons show no-crash warning; 3y shows late crash note", async ({ page }) => {
  await page.goto("/intelligence/sip-vs-panic", { waitUntil: "networkidle" });

  const durationThumb = page.locator('[data-testid="duration-years-slider"] [role="slider"]').first();
  await expect(durationThumb).toBeVisible();

  // 1 year
  await durationThumb.focus();
  await durationThumb.press("Home");
  await expect(page.getByText(/Short horizon scenario/i)).toBeVisible();
  await expect(page.getByText(/Crash occurs after your investment ends/i)).toBeVisible();

  // 2 years
  await durationThumb.press("ArrowRight");
  await expect(page.getByText(/Short horizon scenario/i)).toBeVisible();

  // 3 years
  await durationThumb.press("ArrowRight");
  await expect(page.getByText(/3-year scenario/i)).toBeVisible();
  await expect(page.getByText(/Crash begins around Month 30/i)).toBeVisible();
});

test.describe("SIP vs Panic (mobile)", () => {
  const viewports = [
    { name: "iPhone SE", viewport: { width: 375, height: 667 } },
    { name: "iPhone 12", viewport: { width: 390, height: 844 } },
    { name: "Pixel 5", viewport: { width: 393, height: 851 } },
    { name: "iPad", viewport: { width: 768, height: 1024 } },
    { name: "Desktop 1920", viewport: { width: 1920, height: 1080 } },
  ];

  for (const { name, viewport } of viewports) {
    test.describe(name, () => {
      test.use({ viewport });

      test("loads without overflow; core controls tappable; no console errors", async ({ page }) => {
        const consoleErrors = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });
        page.on("pageerror", (err) => consoleErrors.push(String(err)));

        await page.goto("/intelligence/sip-vs-panic", { waitUntil: "networkidle" });

        await expect(
          page.getByRole("heading", { name: /What Happens If You Stop SIP During a Market Crash\?/i })
        ).toBeVisible();
        const runBtn = page.getByRole("button", { name: /Run(\s+Simulation|\s*\(Save\s*&\s*Share\))?/i });
        await expect(runBtn).toBeVisible({ timeout: 15000 });

        // Basic horizontal overflow guard.
        const hasOverflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return doc.scrollWidth > doc.clientWidth + 2;
        });
        expect(hasOverflow).toBeFalsy();

        // Tappability check: enforce 44px minimum on touch-sized viewports.
        const minTap = viewport.width < 900 ? 44 : 32;
        const runBox = await runBtn.boundingBox();
        expect(runBox && runBox.height >= minTap).toBeTruthy();

        const shareBtn = page.getByRole("button", { name: /Share.*WhatsApp/i });
        await expect(shareBtn).toBeVisible();
        const shareBox = await shareBtn.boundingBox();
        expect(shareBox && shareBox.height >= minTap).toBeTruthy();

        expect(consoleErrors, consoleErrors.join("\n")).toEqual([]);
      });
    });
  }
});
