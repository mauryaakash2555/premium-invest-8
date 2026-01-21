/**
 * Playwright script to capture live store.bmwealth.co.in screenshots
 * Run: npx playwright test scripts/screenshot-store-live.mjs --headed
 * Or:  node scripts/screenshot-store-live.mjs
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../playwright-report');

const STORE_BASE = 'https://store.bmwealth.co.in';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const results = [];

  // 1. Store Home
  const pageHome = await context.newPage();
  await pageHome.goto(STORE_BASE, { waitUntil: 'networkidle', timeout: 30000 });
  const homeTitle = await pageHome.title();
  const homeScreenshot = path.join(outDir, 'store-home-live.png');
  await pageHome.screenshot({ path: homeScreenshot, fullPage: true });
  results.push({ page: 'Store Home', url: STORE_BASE, title: homeTitle, screenshot: homeScreenshot });
  await pageHome.close();

  // 2. Store Products
  const pageProducts = await context.newPage();
  const productsUrl = `${STORE_BASE}/products`;
  let productsStatus = 200;
  pageProducts.on('response', (res) => {
    if (res.url() === productsUrl) productsStatus = res.status();
  });
  try {
    await pageProducts.goto(productsUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    productsStatus = 'timeout/error';
  }
  const productsTitle = await pageProducts.title();
  const productsScreenshot = path.join(outDir, 'store-products-live.png');
  await pageProducts.screenshot({ path: productsScreenshot, fullPage: true });
  results.push({ page: 'Store Products', url: productsUrl, status: productsStatus, title: productsTitle, screenshot: productsScreenshot });
  await pageProducts.close();

  // 3. Check /blog on store host (should 404 or redirect)
  const pageBlog = await context.newPage();
  const blogUrl = `${STORE_BASE}/blog`;
  let blogStatus = 200;
  pageBlog.on('response', (res) => {
    if (res.url() === blogUrl || res.url().startsWith(blogUrl)) blogStatus = res.status();
  });
  try {
    await pageBlog.goto(blogUrl, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) {
    blogStatus = 'timeout/error';
  }
  const blogTitle = await pageBlog.title();
  results.push({ page: '/blog on store host', url: blogUrl, status: blogStatus, title: blogTitle, expected: '404 or redirect' });
  await pageBlog.close();

  // 4. Check /services on store host (should 404 or redirect)
  const pageServices = await context.newPage();
  const servicesUrl = `${STORE_BASE}/services`;
  let servicesStatus = 200;
  pageServices.on('response', (res) => {
    if (res.url() === servicesUrl || res.url().startsWith(servicesUrl)) servicesStatus = res.status();
  });
  try {
    await pageServices.goto(servicesUrl, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) {
    servicesStatus = 'timeout/error';
  }
  const servicesTitle = await pageServices.title();
  results.push({ page: '/services on store host', url: servicesUrl, status: servicesStatus, title: servicesTitle, expected: '404 or redirect' });
  await pageServices.close();

  await browser.close();

  console.log('\n========== LIVE STORE SCREENSHOT RESULTS ==========\n');
  for (const r of results) {
    console.log(`${r.page}`);
    console.log(`  URL: ${r.url}`);
    if (r.status !== undefined) console.log(`  HTTP Status: ${r.status}`);
    console.log(`  Title: ${r.title}`);
    if (r.screenshot) console.log(`  Screenshot: ${r.screenshot}`);
    if (r.expected) console.log(`  Expected: ${r.expected}`);
    console.log('');
  }

  // Verdict
  const homeIsStore = homeTitle.toLowerCase().includes('store') || homeTitle.toLowerCase().includes('digital');
  const blogBlocked = blogStatus === 404 || blogStatus === 302 || blogStatus === 301;
  const servicesBlocked = servicesStatus === 404 || servicesStatus === 302 || servicesStatus === 301;

  console.log('========== VERDICT ==========');
  console.log(`Store Home title indicates store-only app: ${homeIsStore ? 'YES' : 'NO (FAIL)'}`);
  console.log(`/blog blocked on store host: ${blogBlocked ? 'YES' : 'NO (FAIL)'}`);
  console.log(`/services blocked on store host: ${servicesBlocked ? 'YES' : 'NO (FAIL)'}`);
  if (!homeIsStore || !blogBlocked || !servicesBlocked) {
    console.log('\n❌ LIVE STORE IS NOT ISOLATED — DEPLOYMENT FIX REQUIRED');
  } else {
    console.log('\n✅ LIVE STORE IS CORRECTLY ISOLATED');
  }
}

run().catch((err) => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
