import { chromium, expect } from '@playwright/test';
import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';

function makeTestPdfBuffer() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Form 16 - Test Document (digital)', 40, 40);
  doc.text('PAN: ABCDE1234F', 40, 60);
  doc.text('TAN: ABCD12345E', 40, 80);
  doc.text('Assessment Year: 2025-26', 40, 100);
  doc.text('Employer: Example Employer Pvt Ltd', 40, 120);
  doc.text('Salary as per provisions contained in section 17(1): 850000', 40, 150);
  doc.text('Total (Rs.) tax deducted: 125000', 40, 170);
  doc.text('Standard Deduction u/s 16(ia): 50000', 40, 190);
  doc.text('Deduction under section 80C: 100000', 40, 210);
  doc.text('HRA Exemption: 120000', 40, 230);
  doc.text('Filler: '.repeat(80), 40, 260);
  return Buffer.from(doc.output('arraybuffer'));
}

async function main() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  const outDir = path.join(process.cwd(), 'playwright-report');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'itr-step3.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL, viewport: { width: 1280, height: 720 } });

  await page.goto('/tools/itr-filing-help');
  await page.locator('[data-itr-hydrated="1"]').waitFor({ state: 'attached', timeout: 15000 });

  const fileInput = page.locator('#file-upload');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles({
    name: 'form16_test.pdf',
    mimeType: 'application/pdf',
    buffer: makeTestPdfBuffer(),
  });

  await page.evaluate(() => {
    const el = document.querySelector('#file-upload');
    if (!el) return;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await page.getByRole('heading', { name: 'Verify Extracted Values' }).waitFor({ state: 'visible', timeout: 30000 });

  await page.getByPlaceholder('Enter Gross Salary').fill('850000');
  await page.getByPlaceholder('Enter TDS Deducted').fill('125000');
  await page.getByPlaceholder('Enter Standard Deduction').fill('50000');
  await page.getByPlaceholder('Enter 80C Deductions').fill('100000');

  await page.getByText('I verified Gross Salary is correct').click();
  await page.getByText('I verified TDS Deducted is correct').click();
  await page.getByText('I verified Standard Deduction is correct').click();
  await page.getByText('I verified 80C Deductions is correct').click();

  await page.getByRole('button', { name: /Calculate Tax/i }).click();
  await page.getByText('Old Tax Regime').waitFor({ state: 'visible', timeout: 15000 });

  await page.getByRole('button', { name: 'Continue to Filing Checklist →' }).click();
  await page.getByRole('heading', { name: 'Step 3 — Your filing checklist' }).waitFor({ state: 'visible', timeout: 15000 });

  // Screenshot just the Step 3 area (container)
  const container = page.locator('[data-itr-hydrated="1"]').locator('..');
  await container.screenshot({ path: outPath, fullPage: true });

  console.log(`WROTE_SCREENSHOT: ${outPath}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
