import { test, expect } from '@playwright/test';
import { jsPDF } from 'jspdf';

function makeTestPdfBuffer() {
  if (makeTestPdfBuffer._cached) return makeTestPdfBuffer._cached;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Form 16 - Test Document', 40, 40);
  const buf = Buffer.from(doc.output('arraybuffer'));
  makeTestPdfBuffer._cached = buf;
  return buf;
}

test('ITR Filing Help: upload PDF + manual input + calculate', async ({ page }) => {
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

  await page.goto('/tools/itr-filing-help');
  await expect(page.getByRole('heading', { name: 'Free ITR Filing Help' })).toBeVisible();
  await expect(page.getByText('Upload Form 16, AIS, or Bank Interest Statement')).toBeVisible();

  // Upload PDF
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'form16_test.pdf',
    mimeType: 'application/pdf',
    buffer: makeTestPdfBuffer(),
  });

  // Should show scanned PDF message and manual form
  await expect(page.getByText('scanned/image-based')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'Enter Values Manually' })).toBeVisible();

  // Fill in manual values
  await page.getByPlaceholder('e.g. 12,00,000').fill('1200000');
  await page.getByPlaceholder('e.g. 1,20,000').fill('120000');
  
  // Click calculate
  await page.getByRole('button', { name: 'Calculate Tax' }).click();

  // Should show calculation results
  await expect(page.getByText('Tax Calculation')).toBeVisible();
  await expect(page.getByText('Total Income')).toBeVisible();

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
