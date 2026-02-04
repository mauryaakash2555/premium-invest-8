import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

test.describe('ITR OCR pipeline (digital PDF)', () => {
  test('upload -> extract -> validate -> download json', async ({ request, page }) => {
    // Ensure fixtures exist.
    execSync('node scripts/itr/generate-fixtures.mjs', { stdio: 'inherit' });
    const pdfPath = path.join(process.cwd(), 'tests', 'fixtures', 'form16_clean.pdf');
    expect(fs.existsSync(pdfPath)).toBeTruthy();

    const buf = fs.readFileSync(pdfPath);

    const uploadResp = await request.post('/api/itr/upload', {
      multipart: {
        files: {
          name: 'form16_clean.pdf',
          mimeType: 'application/pdf',
          buffer: buf,
        },
      },
    });
    expect(uploadResp.ok()).toBeTruthy();
    const upload = await uploadResp.json();
    expect(upload.ok).toBeTruthy();
    expect(upload.files.length).toBe(1);
    const fileId = upload.files[0].fileId;

    const extractResp = await request.post('/api/itr/extract', {
      data: { fileIds: [fileId] },
    });
    expect(extractResp.ok()).toBeTruthy();
    const extract = await extractResp.json();
    expect(extract.ok).toBeTruthy();
    expect(extract.results[0].ok).toBeTruthy();

    const fields = extract.results[0].fields;
    expect(Array.isArray(fields)).toBeTruthy();

    const tds = fields.find((f) => f.key === 'tds_total');
    expect(tds).toBeTruthy();
    // Must be traceable.
    expect(tds.source).toBeTruthy();
    expect(tds.source.page).toBeTruthy();
    expect(tds.source.bbox).toBeTruthy();

    const validateResp = await request.post('/api/itr/validate', {
      data: { fileIds: [fileId] },
    });
    expect(validateResp.ok()).toBeTruthy();
    const report = await validateResp.json();
    expect(report.status === 'ok' || report.status === 'warning').toBeTruthy();

    const downloadResp = await request.get(`/api/itr/download-json?fileIds=${encodeURIComponent(fileId)}`);
    expect(downloadResp.ok()).toBeTruthy();
    const dl = await downloadResp.json();
    expect(dl.ok).toBeTruthy();
    expect(dl.files.length).toBe(1);

    // UI smoke: tool page loads.
    await page.goto('/tools/itr-filing-help');
    await expect(page.getByText('Upload Documents')).toBeVisible();
  });
});
