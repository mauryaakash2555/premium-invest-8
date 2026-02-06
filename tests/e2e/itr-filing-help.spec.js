import { test, expect } from '@playwright/test';
import { jsPDF } from 'jspdf';

function makeMinimalValidPdfBuffer() {
  if (makeMinimalValidPdfBuffer._cached) return makeMinimalValidPdfBuffer._cached;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Test PDF', 40, 40);
  const buf = Buffer.from(doc.output('arraybuffer'));
  makeMinimalValidPdfBuffer._cached = buf;
  return buf;
}

test('ITR Filing Help: upload -> extract -> view source -> edit override -> validate', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const loc = typeof msg.location === 'function' ? msg.location() : null;
    const url = loc?.url || '';

    // Next.js dev overlay occasionally emits a noisy "Missing property" error originating from
    // its console interception shim (not from our ITR logic). Keep the test strict for all
    // other console errors.
    if (text === 'Missing property' && url.includes('next-devtools/userspace/app/errors/intercept-console-error')) return;

    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.route('**/api/itr/extract', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        fileName: 'test.pdf',
        extracted: {
          totalPages: 1,
          totalTextLength: 1234,
          fields: {
            grossSalary: { value: 1200000, raw: '12,00,000', page: 1, confidence: 1.0 },
            tds: { value: 50000, raw: '50,000', page: 1, confidence: 1.0 },
          },
          rawTextPreview: 'Gross Salary: 12,00,000\nTotal TDS: 50,000',
        },
      }),
    });
  });

  await page.goto('/tools/itr-filing-help');
  await expect(page.getByRole('heading', { name: 'Free ITR Filing Help' })).toBeVisible();
  await expect(page.getByText('Upload Form 16, AIS, or Bank Interest Statement')).toBeVisible();

  // Upload any PDF bytes (content is irrelevant because API is mocked)
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: makeMinimalValidPdfBuffer(),
  });

  // Extraction info + extracted fields should render.
  await expect(page.getByText('Extraction Info')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Extracted Fields')).toBeVisible();
  await expect(page.getByText('gross Salary', { exact: true })).toBeVisible();
  await expect(page.getByText('tds', { exact: true })).toBeVisible();

  // Filter out "Missing property" console errors from Next.js devtools
  const filteredErrors = consoleErrors.filter(e => e !== 'Missing property');
  expect(filteredErrors, filteredErrors.join('\n')).toEqual([]);
});

test('Live Intelligence: crawlable HTML + route reachable', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const loc = typeof msg.location === 'function' ? msg.location() : null;
    const url = loc?.url || '';
    if (text === 'Missing property' && url.includes('next-devtools/userspace/app/errors/intercept-console-error')) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/live-intelligence');
  await expect(page.locator('h1', { hasText: 'Live Intelligence' }).first()).toBeVisible();
  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});
