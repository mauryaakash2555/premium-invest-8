import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const REPORT_DIR = path.resolve(process.cwd(), 'playwright-report');

const TARGETS = [
  {
    label: 'tax-optimization-pdf',
    url: 'https://store.bmwealth.co.in/products/tax-optimization-pdf',
  },
  {
    label: 'property-vs-sip-pdf',
    url: 'https://store.bmwealth.co.in/products/property-vs-sip-pdf',
  },
];

function safeName(s) {
  return String(s || '').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('========== LIVE STORE ₹299 PRODUCTS ==========');

  for (const t of TARGETS) {
    const outPath = path.join(REPORT_DIR, `store-product-${safeName(t.label)}-live.png`);
    try {
      const res = await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      const status = res?.status?.() ?? 'unknown';
      const title = await page.title();

      // give the page a moment for client hydration
      await page.waitForTimeout(1200);
      await page.screenshot({ path: outPath, fullPage: true });

      console.log(`\n${t.label}`);
      console.log(`  URL: ${t.url}`);
      console.log(`  HTTP Status: ${status}`);
      console.log(`  Title: ${title}`);
      console.log(`  Screenshot: ${outPath}`);
    } catch (e) {
      console.log(`\n${t.label}`);
      console.log(`  URL: ${t.url}`);
      console.log(`  ERROR: ${e?.message || String(e)}`);
    }
  }

  await page.close();
  await browser.close();
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exitCode = 1;
});
