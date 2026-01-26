import { chromium } from '@playwright/test';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node .tools/diagnose-staging.mjs <url>');
  process.exit(2);
}

const timeoutMs = 30_000;

function isIgnorableConsole(msgType, text) {
  // Ignore noisy but common third-party warnings.
  if (msgType === 'warning' && /Failed to load resource/i.test(text)) return true;
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    const entry = { type: msg.type(), text: msg.text() };
    if (!isIgnorableConsole(entry.type, entry.text)) consoleMessages.push(entry);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err?.stack || err));
  });
  page.on('requestfailed', (req) => {
    const failure = req.failure();
    const status = failure?.errorText || 'requestfailed';
    consoleMessages.push({ type: 'requestfailed', text: `${status}: ${req.url()}` });
  });

  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  console.log('goto:', resp?.status(), resp?.url());

  // Give client-side hydration errors time to surface.
  await page.waitForTimeout(5000);

  console.log('finalUrl:', page.url());

  if (pageErrors.length) {
    console.log('--- PAGEERRORS ---');
    for (const e of pageErrors) console.log(e);
  }

  const severe = consoleMessages.filter((m) => m.type === 'error' || m.type === 'pageerror' || m.type === 'requestfailed');
  if (severe.length) {
    console.log('--- CONSOLE (severe) ---');
    for (const m of severe) console.log(`[${m.type}] ${m.text}`);
  }

  await browser.close();

  if (pageErrors.length || severe.some((m) => m.type === 'error')) process.exit(1);
  process.exit(0);
})();
