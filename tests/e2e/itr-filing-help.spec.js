import { test, expect } from '@playwright/test';

function buildMockExtractResponse() {
  const text = [
    'FORM 16',
    'Certificate under section 203 of the Income-tax Act',
    'Gross Salary 500000',
    'Section 80C 150000',
    'Section 80D 25000',
    'TDS Deducted 50000',
  ].join('\n');

  return {
    method: 'pdfplumber',
    totalPages: 1,
    pages: [{ pageNumber: 1, text }],
    hasSelectableText: true,
  };
}

test('ITR Filing Help: extraction -> review -> regime toggle -> PDF download', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.route('**/api/itr/extract-text', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(buildMockExtractResponse()),
    });
  });

  await page.goto('/tools/itr-filing-help');
  await expect(page.getByRole('heading', { name: 'Free ITR Filing Help' })).toBeVisible();

  // Upload any PDF bytes (content is irrelevant because API is mocked)
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n'),
  });

  await page.getByRole('button', { name: 'Extract Data from PDF' }).click();

  await expect(page.getByText(/Detected:\s*Form 16/i)).toBeVisible();
  await expect(page.getByText('Extraction status: Assisted (Review required)')).toBeVisible();

  // Fields should be editable and show extracted values.
  // Use more specific selectors to avoid matching parent containers.
  const grossSalaryInput = page.locator('div.space-y-1\\.5:has(label:has-text("Gross Salary")) input').first();
  await grossSalaryInput.focus();
  await expect(grossSalaryInput).toHaveValue('500000');

  // Exemptions is missing in mock; should remain empty.
  const exemptionsInput = page.locator('div.space-y-1\\.5:has(label:has-text("Exemptions")) input').first();
  await exemptionsInput.focus();
  await expect(exemptionsInput).toHaveValue('');

  // 80D split fields should exist.
  const d80dSelf = page.locator('div.space-y-1\\.5:has(label:has-text("80D Self/Family")) input').first();
  await d80dSelf.focus();
  await expect(d80dSelf).toHaveValue('25000');

  const d80dParents = page.locator('div.space-y-1\\.5:has(label:has-text("80D Parents")) input').first();
  await d80dParents.focus();
  await expect(d80dParents).toHaveValue('');

  // Switch to Old regime and proceed.
  await page.getByRole('button', { name: /Old Regime/i }).click();

  await page.getByLabel(/I have reviewed/i).check();

  await page.getByRole('button', { name: 'Continue to Result' }).click();
  await expect(page.getByText(/Calculated using\s+Old\s+Regime/i)).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF Summary' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('BM_Wealth_Tax_Estimate');

  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});

test('Live Intelligence: crawlable HTML + route reachable', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('/live-intelligence');
  await expect(page.locator('h1', { hasText: 'Live Intelligence' }).first()).toBeVisible();
  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});
