/* Diagnostic: check if floating chat trigger renders and whether any client errors block hydration. */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e?.message || String(e)}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('response', async (res) => {
    try {
      const status = res.status();
      if (status === 404) {
        errors.push(`http404: ${res.url()}`);
      }
    } catch {
      // ignore
    }
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  const triggerCount = await page.getByRole('button', { name: /open chat/i }).count();
  const dialogCount = await page.getByRole('dialog').count();

  console.log(JSON.stringify({ triggerCount, dialogCount, errorsCount: errors.length }, null, 2));
  if (errors.length) {
    console.log('\n--- errors ---');
    console.log(errors.join('\n'));
  }

  await browser.close();
})().catch((e) => {
  console.error('diagnose_failed:', e);
  process.exit(1);
});
