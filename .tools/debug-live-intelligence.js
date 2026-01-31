/* Debug script: open /live-intelligence and print client-side errors. */

const { chromium } = require('@playwright/test');

(async () => {
  const targetUrl = process.env.TARGET_URL || 'http://localhost:3015/live-intelligence';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('requestfailed', (req) => {
    const failure = req.failure();
    console.log(
      'REQUESTFAILED:',
      req.resourceType(),
      req.url(),
      failure?.errorText || '(unknown error)'
    );
  });

  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) {
      const req = res.request();
      console.log('HTTPERR:', status, req.resourceType(), res.url());
    }
  });

  page.on('pageerror', (err) => {
    console.log('PAGEERROR:', err?.stack || String(err));
  });

  page.on('crash', () => {
    console.log('PAGECRASH: Page crashed');
  });

  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      const loc = msg.location && msg.location();
      const where = loc && loc.url ? ` @ ${loc.url}:${loc.lineNumber || 0}:${loc.columnNumber || 0}` : '';
      console.log('CONSOLE', type.toUpperCase() + ':', msg.text() + where);
    }
  });

  const resp = await page.goto(targetUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  console.log('HTTP', resp?.status());

  // Give the app time to hydrate and run client-side effects.
  await page.waitForTimeout(10_000);

  const hasAppError = await page
    .locator('text=Application error')
    .first()
    .isVisible()
    .catch(() => false);
  console.log('HAS_APP_ERROR', hasAppError);

  const h1 = await page
    .locator('h1')
    .first()
    .textContent()
    .catch(() => null);
  console.log('H1', h1 ? h1.trim() : null);

  await browser.close();
})();
