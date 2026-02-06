import { test, expect } from '@playwright/test';
import { jsPDF } from 'jspdf';

function makePdfWithSalaryData() {
  if (makePdfWithSalaryData._cached) return makePdfWithSalaryData._cached;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  // Add text that matches the extraction regex patterns
  doc.text('Form 16 - Salary Details', 40, 40);
  doc.text('Gross Salary: 12,00,000', 40, 70);
  doc.text('Total TDS: 50,000', 40, 100);
  doc.text('Net Salary: 10,50,000', 40, 130);
  const buf = Buffer.from(doc.output('arraybuffer'));
  makePdfWithSalaryData._cached = buf;
  return buf;
}

test('ITR Filing Help: client-side PDF extraction works', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    const loc = typeof msg.location === 'function' ? msg.location() : null;
    const url = loc?.url || '';

    // Next.js dev overlay occasionally emits a noisy "Missing property" error
    if (text === 'Missing property' && url.includes('next-devtools/userspace/app/errors/intercept-console-error')) return;

    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/tools/itr-filing-help');
  await expect(page.getByRole('heading', { name: 'Free ITR Filing Help' })).toBeVisible();
  await expect(page.getByText('Upload Form 16, AIS, or Bank Interest Statement')).toBeVisible();

  // Upload PDF with salary data that matches extraction regex
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'form16_test.pdf',
    mimeType: 'application/pdf',
    buffer: makePdfWithSalaryData(),
  });

  // Client-side extraction should render results
  await expect(page.getByText('Extraction Info')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Extracted Fields')).toBeVisible();
  
  // Verify fields were extracted - use exact label match
  await expect(page.getByText('Gross Salary', { exact: true })).toBeVisible();
  await expect(page.getByText('TDS', { exact: true })).toBeVisible();

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
