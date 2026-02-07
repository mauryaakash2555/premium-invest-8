/**
 * Playwright configuration for E2E tests
 * Run: npx playwright test
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: (() => {
    if (process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1") return undefined;

    const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
    const isLocal =
      String(baseURL).startsWith("http://localhost") || String(baseURL).startsWith("http://127.0.0.1");
    if (!isLocal) return undefined;

    let port = "3000";
    try {
      const u = new URL(String(baseURL));
      port = u.port || port;
    } catch {
      // ignore
    }

    const shouldKillPort = port !== "3000";
    const command = shouldKillPort
      ? `node scripts/kill-port.mjs ${port} && npx next dev -H 127.0.0.1 -p ${port}`
      : `npx next dev -H 127.0.0.1 -p ${port}`;

    return {
      command,
      url: String(baseURL),
      // Never reuse for test-only ports (e.g. 3001) to avoid flakiness
      // when a stale server is running.
      reuseExistingServer: !process.env.CI && !shouldKillPort,
      timeout: 120 * 1000,
    };
  })(),
});
