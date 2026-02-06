import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

test.describe('ITR OCR pipeline (digital PDF)', () => {
  test('extract -> view results', async ({ request, page }) => {
    // Ensure fixtures exist.
    execSync('node scripts/itr/generate-fixtures.mjs', { stdio: 'inherit' });
    const pdfPath = path.join(process.cwd(), 'tests', 'fixtures', 'form16_clean.pdf');
    expect(fs.existsSync(pdfPath)).toBeTruthy();

    const buf = fs.readFileSync(pdfPath);

    const extractResp = await request.post('/api/itr/extract', {
      multipart: {
        file: {
          name: 'form16_clean.pdf',
          mimeType: 'application/pdf',
          buffer: buf,
        },
      },
    });
    expect(extractResp.ok()).toBeTruthy();
    const extract = await extractResp.json();
    expect(extract.success).toBeTruthy();
    expect(extract.extracted).toBeTruthy();
    expect(extract.extracted.totalPages).toBeGreaterThan(0);
    expect(Array.isArray(extract.extracted.rawText)).toBeTruthy();
    expect(extract.extracted.rawText.length).toBeGreaterThan(0);

    // UI smoke: tool page loads.
    await page.goto('/tools/itr-filing-help');
    await expect(page.getByText('Upload Form 16, AIS, or Bank Interest Statement')).toBeVisible();
  });
});
