import { extractText } from 'unpdf';

/** Best-effort save extraction to Supabase storage */
async function persistExtraction(extractionResult) {
  try {
    const { uploadJson, extractionKey } = await import('@/lib/itr/remoteStore');
    const sessionId = 'web-' + Date.now().toString(36);
    const fileId = Math.random().toString(36).slice(2, 10);
    const key = extractionKey({ sessionId, fileId });
    await uploadJson({ key, obj: { ...extractionResult, storedAt: new Date().toISOString() } });
  } catch (e) {
    // Non-blocking — don't fail the extraction if storage is unavailable
    console.warn('[ITR extract-v2] Failed to persist extraction:', e?.message || e);
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ success: false, error: 'No file' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    let text = '';

    try {
      const result = await extractText(new Uint8Array(buffer), { mergePages: true });
      text = result.text || '';
    } catch (e) {
      text = '';
    }

    const isScanned = text.trim().length < 100;

    if (isScanned) {
      return Response.json({
        success: true,
        isScanned: true,
        fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
        employeePAN: '',
        employerName: '',
        employerTAN: '',
        assessmentYear: '',
        hraExemption: 0,
        regime: '',
        confidence: 0,
        message: 'Scanned PDF detected — please enter values manually while viewing your document'
      });
    }

    const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };

    const safeNumber = (raw) => {
      if (raw == null) return 0;
      const s = String(raw).replace(/,/g, '').trim();
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : 0;
    };

    const firstLineAfter = (haystack, marker) => {
      const idx = haystack.toLowerCase().indexOf(String(marker).toLowerCase());
      if (idx < 0) return '';
      const after = haystack.slice(idx + marker.length);
      const lines = after.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      return lines[0] || '';
    };

    /** Extract ONLY the company name — strip address, numbers, and Form 16 boilerplate */
    const extractEmployerNameOnly = (raw) => {
      let s = String(raw || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      // Cut at first occurrence of typical address/number markers
      s = s.split(/\b(floor|plot|road|street|lane|nagar|sector|bldg|bandra|mumbai|delhi|bangalore|chennai|hyderabad|pune|kolkata|gurgaon|block|tower|area|phase|pin\s*[-:]?\s*\d|\d{6}|Survey No|Regd|CIN|PAN|TAN|Tel|Fax|Email|Website|Phone)\b/i)[0].trim();
      // Remove trailing commas, dashes, dots
      s = s.replace(/[,\-\.\s]+$/, '').trim();
      // Hard cap at 80 characters
      if (s.length > 80) s = s.slice(0, 79) + '\u2026';
      return s;
    };

    // Additional extracted fields (do not interfere with existing extraction)
    let employeePAN = '';
    let employerName = '';
    let employerTAN = '';
    let assessmentYear = '';
    let hraExemption = 0;
    let regime = '';

    let mm = text.match(/PAN of the Employee[^\n]*\n*([A-Z]{5}[0-9]{4}[A-Z])/i);
    if (mm) employeePAN = mm[1];

    employerName = extractEmployerNameOnly(firstLineAfter(text, 'Name and address of the Employer'));

    mm = text.match(/TAN of the Deductor\s+([A-Z]{4}[0-9]{5}[A-Z])/i);
    if (mm) employerTAN = mm[1];

    mm = text.match(/Assessment Year\s+(\d{4}-\d{2,4})/i);
    if (mm) assessmentYear = mm[1];

    mm = text.match(/House rent allowance under section 10\(13A\)[^\d]{0,20}([\d.]+)/i);
    if (mm) hraExemption = safeNumber(mm[1]);

    mm = text.match(/115BAC\s+(Yes|No)/i);
    if (mm) regime = String(mm[1]).toLowerCase() === 'no' ? 'Old Regime' : 'New Regime';

    let m = text.match(/section\s+17\s*\(\s*1\s*\)[^\d]{0,80}([\d,]{5,})/i);
    if (m) fields.grossSalary = parseInt(m[1].replace(/,/g, ''));

    m = text.match(/Total\s*\(Rs\.\)\s+([\d,]+)/i);
    if (m) fields.tds = parseInt(m[1].replace(/,/g, ''));

    // Standard Deduction — try multiple patterns
    const stdPatterns = [
      /standard\s+deduction\s+under\s+section\s+16\s*\(\s*ia\s*\)[^\d]{0,80}([\d,]{4,})/i,
      /standard\s+deduction[^\d]{0,50}([\d,]{4,})/i,
      /16\s*\(\s*ia\s*\)[^\d]{0,80}([\d,]{4,})/i,
      /Entertainment[^\d]{0,80}(50000)/i
    ];
    for (const p of stdPatterns) {
      const m2 = text.match(p);
      if (m2) {
        const v = parseInt(m2[1].replace(/,/g, ''));
        if (v >= 40000 && v <= 75000) { fields.standardDeduction = v; break; }
      }
    }
    if (!fields.standardDeduction) fields.standardDeduction = 50000; // statutory default FY25-26

    // 80C — try multiple patterns
    const c80Patterns = [
      /80C, 80CCC and 80CCD\(1\)[^\d]{0,20}([\d,]+)/i,
      /total\s+deduction\s+under\s+section\s+80C[^\d]{0,100}([\d,]{5,})/i,
      /provident fund etc\. under section 80C[^\d]{0,50}([\d,]{5,})/i,
      /80C[^\d]{0,50}(1[45][0-9]{4})/i
    ];
    for (const p of c80Patterns) {
      const m2 = text.match(p);
      if (m2) {
        const v = parseInt(m2[1].replace(/,/g, ''));
        if (v > 0 && v <= 150000) { fields.deductions80C = v; break; }
      }
    }

    const found = Object.values(fields).filter(v => v > 0).length;
    const confidence = found >= 3 ? 0.95 : found >= 1 ? 0.75 : 0.5;

    const result = {
      success: true,
      isScanned: false,
      fields,
      employeePAN,
      employerName,
      employerTAN,
      assessmentYear,
      hraExemption,
      regime,
      confidence,
    };

    // Persist extraction to Supabase (non-blocking)
    persistExtraction(result).catch(() => {});

    return Response.json(result);

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
