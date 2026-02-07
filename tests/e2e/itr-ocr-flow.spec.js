import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

test.describe('ITR OCR pipeline (digital PDF)', () => {
  test('extract -> view results', async ({ request, page }) => {
    // Ensure fixtures exist.
    execSync('node scripts/itr/generate-fixtures.mjs', { stdio: 'inherit' });
    const pdfPath = path.join(process.cwd(), 'fixtures', '1_Form16_Sample.pdf');
    expect(fs.existsSync(pdfPath)).toBeTruthy();

    const buf = fs.readFileSync(pdfPath);

    const extractResp = await request.post('/api/itr/extract', {
      multipart: {
        file: {
          name: '1_Form16_Sample.pdf',
          mimeType: 'application/pdf',
          buffer: buf,
        },
      },
    });

    const extract = await extractResp.json();

    // When configured, the endpoint returns extracted fields + confidence + rawTextPreview.
    // When not configured, it should fail safely with a JSON error.
    if (extract.success) {
      expect(extract.fields).toBeTruthy();
      expect(typeof extract.confidence).toBe('number');
      expect(typeof extract.rawTextPreview).toBe('string');
      expect(extract.rawTextPreview.length).toBeGreaterThan(0);

      // Acceptance checklist expectations for the sample Form 16 fixture.
      expect(extract.fields.grossSalary).toBe(2557983);
      expect(extract.fields.tds).toBe(483740);
    } else {
      expect(typeof extract.error).toBe('string');
    }

    // UI smoke: tool page loads.
    await page.goto('/tools/itr-filing-help');
    await expect(page.getByText('Free ITR Filing Help')).toBeVisible();
    await expect(page.getByText('Click to upload PDF')).toBeVisible();
  });
});
