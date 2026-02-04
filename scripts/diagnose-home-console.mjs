import { chromium } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', async (msg) => {
  if (msg.type() !== 'error') return;
  const loc = msg.location?.() || {};
  const text = msg.text();
  // Try to extract useful arguments (may fail for unserializable values)
  const args = [];
  for (const a of msg.args()) {
    try {
      args.push(await a.jsonValue());
    } catch {
      args.push('[unserializable]');
    }
  }
  console.log('[console.error]', text, { location: loc, args });
});

page.on('pageerror', (err) => {
  console.log('[pageerror]', String(err));
});

await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

await browser.close();
