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

    const extract = await extractResp.json();

    // When Google Document AI creds are not configured (local/CI), the endpoint should fail safely.
    if (!extractResp.ok()) {
      expect(extract.success).toBeFalsy();
      expect(typeof extract.error).toBe('string');
      expect(extract.error.toLowerCase()).toContain('google');
    } else {
      // When configured, the endpoint returns extracted fields + confidence + rawText preview.
      expect(extract.success).toBeTruthy();
      expect(extract.fields).toBeTruthy();
      expect(typeof extract.confidence).toBe('number');
      expect(typeof extract.rawText).toBe('string');
      expect(extract.rawText.length).toBeGreaterThan(0);
      expect(extract.rawText.toLowerCase()).toContain('gross');
    }

    // UI smoke: tool page loads.
    await page.goto('/tools/itr-filing-help');
    await expect(page.getByText('Free ITR Filing Help')).toBeVisible();
    await expect(page.getByText('Click to upload PDF')).toBeVisible();
  });
});
