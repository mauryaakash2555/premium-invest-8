import { test, expect } from '@playwright/test';
import { jsPDF } from 'jspdf';

function makeTestPdfBuffer() {
  if (makeTestPdfBuffer._cached) return makeTestPdfBuffer._cached;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  // Keep this fully deterministic: embed digital text that unpdf can extract,
  // so we do NOT hit OCR.space in CI.
  doc.text('Form 16 - Test Document (digital)', 40, 40);
  doc.text('Salary as per provisions contained in section 17(1): 850000', 40, 70);
  doc.text('Total (Rs.) tax deducted: 125000', 40, 90);
  doc.text('Standard Deduction u/s 16(ia): 50000', 40, 110);
  doc.text('Deduction under section 80C: 100000', 40, 130);
  // Add filler so extracted text comfortably exceeds the 200-char OCR threshold.
  doc.text('Filler: '.repeat(50), 40, 160);
  const buf = Buffer.from(doc.output('arraybuffer'));
  makeTestPdfBuffer._cached = buf;
  return buf;
}

function makeLargePdfBuffer() {
  const base = makeTestPdfBuffer();
  // Trailing bytes keep the PDF parseable but push size over 1MB.
  const pad = Buffer.alloc(1_200_000);
  return Buffer.concat([base, pad]);
}

async function gotoItrAndWaitHydrated(page) {
  await page.goto('/tools/itr-filing-help');
  await expect(page.getByRole('heading', { name: 'Free ITR Filing Help' })).toBeVisible();

  // Next dev can briefly 404/abort chunk requests while compiling after changes.
  // If hydration doesn't happen, a reload usually resolves it.
  const hydrationWaitMs = 8000;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.locator('[data-itr-hydrated="1"]').waitFor({ state: 'attached', timeout: hydrationWaitMs });
      return;
    } catch (e) {
      if (attempt === 2) throw e;
      await page.waitForTimeout(1500);
      await page.reload();
    }
  }
}

test('ITR Filing Help: upload PDF + verify + calculate', async ({ page }) => {
  const consoleErrors = [];
  const consoleMsgs = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => {
    try {
      consoleMsgs.push(`${msg.type()}: ${msg.text()}`);
    } catch {
      // ignore
    }
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const loc = typeof msg.location === 'function' ? msg.location() : null;
    const url = loc?.url || '';
    if (text === 'Missing property' && url.includes('next-devtools/userspace/app/errors/intercept-console-error')) return;
    // Dev mode sometimes logs benign missing asset 404s
    if (text.startsWith('Failed to load resource: the server responded with a status of 404')) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
    consoleErrors.push(String(err));
  });
  page.on('requestfailed', (req) => {
    try {
      const url = req.url();
      const failure = req.failure();
      failedRequests.push(`${url} :: ${failure?.errorText || 'failed'}`);
    } catch {
      // ignore
    }
  });

  await gotoItrAndWaitHydrated(page);
  await expect(page.getByText('Upload Form 16, AIS, or Bank Statement')).toBeVisible();

  // Sanity: if hydration still didn't happen, output diagnostics.
  if ((await page.locator('[data-itr-hydrated="1"]').count()) === 0) {
    throw new Error(
      [
        'ITR page did not hydrate (data-itr-hydrated stayed 0).',
        `pageErrors=${pageErrors.length}`,
        ...pageErrors.slice(0, 10),
        `failedRequests=${failedRequests.length}`,
        ...failedRequests.slice(0, 15),
        'recentConsole=',
        ...consoleMsgs.slice(-30),
      ].join('\n')
    );
  }

  // Upload PDF
  // Use the tool's actual hidden input so the onChange handler fires.
  const fileInput = page.locator('#file-upload');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles({
    name: 'form16_test.pdf',
    mimeType: 'application/pdf',
    buffer: makeTestPdfBuffer(),
  });

  // Ensure React sees the change event even if the browser automation is flaky.
  await page.evaluate(() => {
    const el = document.querySelector('#file-upload');
    if (!el) return;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Wait for *either* the extracting stage to appear or the review step to show up.
  // (Fast local responses can skip the extracting UI.)
  await Promise.any([
    page.getByRole('heading', { name: 'Verify Extracted Values' }).waitFor({ state: 'visible', timeout: 8000 }),
    page.getByText('Uploading PDF...').waitFor({ state: 'visible', timeout: 8000 }),
    page.getByText('Extracting data...').waitFor({ state: 'visible', timeout: 8000 }),
  ]);

  // Review step
  await expect(page.getByRole('heading', { name: 'Verify Extracted Values' })).toBeVisible({ timeout: 30000 });

  // Fill / ensure values are present
  await page.getByPlaceholder('Enter Gross Salary').fill('850000');
  await page.getByPlaceholder('Enter TDS Deducted').fill('125000');
  await page.getByPlaceholder('Enter Standard Deduction').fill('50000');
  await page.getByPlaceholder('Enter 80C Deductions').fill('100000');

  // CTA label is gated: disabled state says "Verify all 4 fields...", enabled state says "Calculate Tax →".
  const calculateBtn = page.getByRole('button', { name: /Verify all 4 fields|Calculate Tax/i });
  await expect(calculateBtn).toBeDisabled();

  await page.getByText('I verified Gross Salary is correct').click();
  await page.getByText('I verified TDS Deducted is correct').click();
  await page.getByText('I verified Standard Deduction is correct').click();
  await page.getByText('I verified 80C Deductions is correct').click();

  await expect(calculateBtn).toBeEnabled();
  await calculateBtn.click();

  // Payment step headings
  await expect(page.getByText('Old Tax Regime')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'New Tax Regime' })).toBeVisible();

  const filteredErrors = consoleErrors.filter(e => e !== 'Missing property');
  expect(filteredErrors, filteredErrors.join('\n')).toEqual([]);
});

test('ITR Filing Help: large PDF triggers preview fallback but still works', async ({ page }) => {
  await gotoItrAndWaitHydrated(page);

  const fileInput = page.locator('#file-upload');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles({
    name: 'form16_large.pdf',
    mimeType: 'application/pdf',
    buffer: makeLargePdfBuffer(),
  });

  await page.evaluate(() => {
    const el = document.querySelector('#file-upload');
    if (!el) return;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await Promise.any([
    page.getByRole('heading', { name: 'Verify Extracted Values' }).waitFor({ state: 'visible', timeout: 8000 }),
    page.getByText('Uploading PDF...').waitFor({ state: 'visible', timeout: 8000 }),
    page.getByText('Extracting data...').waitFor({ state: 'visible', timeout: 8000 }),
  ]);

  await expect(page.getByRole('heading', { name: 'Verify Extracted Values' })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('File too large for preview')).toBeVisible();
});

test('Live Intelligence: crawlable HTML + route reachable', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const loc = typeof msg.location === 'function' ? msg.location() : null;
    const url = loc?.url || '';
    if (text === 'Missing property' && url.includes('next-devtools/userspace/app/errors/intercept-console-error')) return;
    if (text.startsWith('Failed to load resource: the server responded with a status of 404')) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/live-intelligence');
  await expect(page.locator('h1', { hasText: 'Live Intelligence' }).first()).toBeVisible();
  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});
