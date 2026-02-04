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

  await page.route('**/api/itr/upload', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        uploadId: 'upload_test',
        files: [{ fileId: 'itrfile_test', filename: 'test.pdf', type: 'DIGITAL_PDF', pages: 1, docType: 'form16' }],
      }),
    });
  });

  await page.route('**/api/itr/extract', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        results: [
          {
            fileId: 'itrfile_test',
            ok: true,
            kind: 'DIGITAL_PDF',
            docType: 'form16',
            fields: [
              {
                key: 'tds_total',
                label: 'Total TDS',
                valueText: '50000',
                status: 'OK',
                reason: null,
                source: {
                  source_file: 'itrfile_test',
                  filename: 'test.pdf',
                  page: 1,
                  pageWidth: 600,
                  pageHeight: 800,
                  bbox: { x0: 10, x1: 80, top: 40, bottom: 60 },
                  raw_text_token: '50000',
                  raw_line_text: 'TDS 50000',
                  confidence: 1,
                },
              },
            ],
          },
        ],
      }),
    });
  });

  await page.route('**/api/itr/override', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });

  await page.route('**/api/itr/validate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'ok', flags: [] }),
    });
  });

  await page.route('**/api/itr/file?fileId=*', async (route) => {
    const pdf = makeMinimalValidPdfBuffer();
    await route.fulfill({ status: 200, contentType: 'application/pdf', body: pdf });
  });

  await page.goto('/tools/itr-filing-help');
  await expect(page.getByRole('heading', { name: 'Free ITR Filing Help' })).toBeVisible();
  await expect(page.getByText('Upload Documents')).toBeVisible();

  // Upload any PDF bytes (content is irrelevant because API is mocked)
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: makeMinimalValidPdfBuffer(),
  });

  // Wait for upload result to render so Extract becomes enabled.
  await expect(page.getByText('file(s) uploaded successfully')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('test.pdf')).toBeVisible();

  await page.getByRole('button', { name: 'Extract Data' }).click();

  // Extracted field appears.
  await expect(page.getByText('Total TDS')).toBeVisible({ timeout: 10000 });
  const tdsInput = page.locator('tr:has-text("tds_total") input').first();
  await expect(tdsInput).toHaveValue('50000');

  // Clicking source opens the side panel.
  await page.getByRole('button', { name: 'Page 1' }).click();
  await expect(page.getByText('PDF Source')).toBeVisible();

  // Edit without re-upload (override)
  await tdsInput.fill('50001');
  await tdsInput.blur();

  // Validate should succeed.
  await page.getByRole('button', { name: 'Validate' }).click();
  await expect(page.getByText('Validation passed')).toBeVisible({ timeout: 10000 });

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
