'use client';

/**
 * DigitalProductsManager — Admin panel to preview & download all paid digital content.
 * Shows PDFs, email templates, letter/doc generators, store products.
 * Mobile-first LUX theme.
 */

import { useCallback, useState } from 'react';

/* ─── Store Products (static) ─── */
const STORE_PRODUCTS = [
  { slug: 'basics-of-personal-finance-pdf', name: 'Basics of Personal Finance', price: 99, type: 'PDF' },
  { slug: 'tax-planning-checklist-pdf', name: 'Tax Planning Checklist', price: 149, type: 'PDF' },
  { slug: 'monthly-savings-toolkit-pdf', name: 'Monthly Savings Toolkit', price: 199, type: 'PDF' },
  { slug: 'tax-optimization-pdf', name: 'ITR Filing Summary (Form 16)', price: 0, type: 'PDF (Free)' },
  { slug: 'property-vs-sip-pdf', name: 'Property vs SIP Report', price: 299, type: 'PDF' },
  { slug: 'form-16-tax-leak-checklist', name: 'Form 16 Tax Leak Checklist', price: 149, type: 'PDF + Checklist' },
  { slug: 'mumbai-tax-leak-playbook', name: 'Mumbai High-Income Playbook', price: 249, type: 'Guide' },
  { slug: 'sip-vs-panic-workbook', name: 'SIP vs Panic Workbook', price: 199, type: 'Excel + PDF' },
  { slug: 'wealth-blueprint-starter-kit', name: 'Wealth Blueprint Starter Kit', price: 399, type: 'Templates + Guide' },
];

/* ─── PDF Generators available ─── */
const PDF_GENERATORS = [
  {
    id: 'itr-summary',
    name: 'ITR Filing Summary PDF',
    desc: 'Premium A4 gold/dark PDF with salary breakdown, regime comparison, deductions, filing guide.',
    fileName: 'ITR-Filing-Summary-BM-Wealth.pdf',
    staticPath: '/ITR-Filing-Summary-BM-Wealth.pdf',
    source: 'scripts/test-pdf-gen.mjs',
  },
  {
    id: 'daily-market',
    name: 'Daily Market Summary PDF',
    desc: 'Auto-generated A4 with NIFTY/SENSEX/BankNIFTY, FII/DII, 6 headlines, QR code.',
    fileName: null,
    generatorType: 'client',
    source: 'lib/live-intelligence/pdfGenerator.js',
  },
  {
    id: 'sip-panic-report',
    name: 'SIP vs Panic Report PDF',
    desc: 'Investment simulation showing discipline vs panic selling, behavioral cost analysis.',
    fileName: null,
    generatorType: 'client',
    source: 'intelligence/ui/sip-panic/DownloadReport.tsx',
  },
];

/* ─── Email Templates ─── */
const EMAIL_TEMPLATES = [
  {
    id: 'property-sip-free',
    name: 'Property vs SIP — Free Summary Email',
    desc: 'Rich "You\'re losing ₹XCr" email with tracking pixel, daily leak numbers, CTA button.',
    source: 'lib/email/propertyVsSipTemplates.js → buildPropertyVsSipFreeSummaryEmail',
  },
  {
    id: 'property-sip-paid',
    name: 'Property vs SIP — Paid PDF Delivery Email',
    desc: 'Payment confirmation + PDF attachment delivery with WhatsApp contact.',
    source: 'lib/email/propertyVsSipTemplates.js → buildPropertyVsSipPaidPdfEmail',
  },
  {
    id: 'tax-blueprint-paid',
    name: 'Tax Blueprint — Paid PDF Email',
    desc: 'Old vs New regime comparison result + PDF attachment.',
    source: 'lib/email/taxBlueprintTemplates.js → buildTaxBlueprintPaidPdfEmail',
  },
  {
    id: 'tax-followup-1',
    name: 'Tax Optimization Follow-up (Step 1)',
    desc: '2-step drip: "Next steps" email after tool use.',
    source: 'lib/email/taxOptimizationFollowupTemplates.js',
  },
  {
    id: 'tax-followup-2',
    name: 'Tax Optimization Follow-up (Step 2)',
    desc: '2-step drip: Reminder email.',
    source: 'lib/email/taxOptimizationFollowupTemplates.js',
  },
  {
    id: 'hot-lead-alert',
    name: 'Hot Lead Alert (Internal)',
    desc: 'Internal alert when a high-score lead comes in.',
    source: 'lib/email/emailService.js → sendHotLeadAlert',
  },
  {
    id: 'daily-summary',
    name: 'Daily Summary (Internal)',
    desc: 'Daily KPI digest email.',
    source: 'lib/email/emailService.js → sendDailySummary',
  },
];

/* ─── WhatsApp Templates ─── */
const WA_TEMPLATES = [
  { id: 'wa-instant', name: 'After Purchase — Instant', source: 'lib/templates/whatsappFollowups.js' },
  { id: 'wa-24h', name: 'After Purchase — 24 Hours', source: 'lib/templates/whatsappFollowups.js' },
  { id: 'wa-5-7d', name: 'After Purchase — 5-7 Days', source: 'lib/templates/whatsappFollowups.js' },
];

/* ─── Test Fixtures (sample PDFs) ─── */
const TEST_PDFS = [
  { name: 'Form 16 Sample', path: '/tests/fixtures/1_Form16_Sample.pdf' },
  { name: 'Form 16 Clean', path: '/tests/fixtures/form16_clean.pdf' },
  { name: 'Bank Interest Statement', path: '/tests/fixtures/bank_interest.pdf' },
  { name: 'AIS Sample', path: '/tests/fixtures/ais_sample.pdf' },
];

export function DigitalProductsManager() {
  const [activeSection, setActiveSection] = useState('products');
  const [genStatus, setGenStatus] = useState({});

  const generateDailyPdf = useCallback(async () => {
    setGenStatus(s => ({ ...s, 'daily-market': 'generating' }));
    try {
      const { downloadDailySummaryPDF } = await import('@/lib/live-intelligence/pdfGenerator');
      await downloadDailySummaryPDF({ summary: {}, headlines: [] });
      setGenStatus(s => ({ ...s, 'daily-market': 'done' }));
    } catch (err) {
      setGenStatus(s => ({ ...s, 'daily-market': 'error: ' + err.message }));
    }
  }, []);

  const sections = [
    { id: 'products', label: 'Store Products' },
    { id: 'pdfs', label: 'PDF Generators' },
    { id: 'emails', label: 'Email Templates' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'fixtures', label: 'Test PDFs' },
  ];

  return (
    <div>
      <div className="sa-panelHead" style={{ marginBottom: 16 }}>
        <div className="sa-panelTitle">DIGITAL PRODUCTS & TEMPLATES</div>
      </div>

      {/* Section pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {sections.map(s => (
          <button
            key={s.id}
            className={`sa-miniBtn${activeSection === s.id ? ' sa-miniBtnActive' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Store Products ── */}
      {activeSection === 'products' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            9 products in store catalog. Click to preview the store page.
          </div>
          {STORE_PRODUCTS.map(p => (
            <div key={p.slug} className="sa-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="sa-rowTitle">{p.name}</div>
                <div className="sa-rowSub">{p.type} — ₹{p.price}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <a
                  href={`https://store.bmwealth.co.in/products/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sa-miniBtn"
                  style={{ textDecoration: 'none' }}
                >
                  Live Store ↗
                </a>
                <a
                  href={`/store/products/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sa-miniBtn"
                  style={{ textDecoration: 'none' }}
                >
                  Preview ↗
                </a>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(214,179,106,0.06)', border: '1px solid rgba(214,179,106,0.15)', fontSize: 12 }}>
            <strong>⚠️ Not promoted on main site:</strong>
            <div style={{ marginTop: 6, lineHeight: 1.6, color: 'var(--sa-muted)' }}>
              • Basics of Personal Finance (₹99)<br />
              • Tax Planning Checklist (₹149)<br />
              • Monthly Savings Toolkit (₹199)<br />
              <span style={{ marginTop: 4, display: 'block', fontSize: 11, opacity: 0.7 }}>
                These 3 products have zero links from tools, blog, or calculators.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF Generators ── */}
      {activeSection === 'pdfs' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {PDF_GENERATORS.map(g => (
            <div key={g.id} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div className="sa-rowTitle">{g.name}</div>
                  <div className="sa-rowSub">{g.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {g.staticPath && (
                    <a
                      href={g.staticPath}
                      download
                      className="sa-miniBtn sa-miniBtnActive"
                      style={{ textDecoration: 'none' }}
                    >
                      Download ↓
                    </a>
                  )}
                  {g.id === 'daily-market' && (
                    <button
                      className="sa-miniBtn sa-miniBtnActive"
                      onClick={generateDailyPdf}
                      disabled={genStatus['daily-market'] === 'generating'}
                    >
                      {genStatus['daily-market'] === 'generating' ? 'Generating…' :
                       genStatus['daily-market'] === 'done' ? '✅ Downloaded' :
                       'Generate & Download'}
                    </button>
                  )}
                  {g.id === 'sip-panic-report' && (
                    <a
                      href="/intelligence/sip-vs-panic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sa-miniBtn"
                      style={{ textDecoration: 'none' }}
                    >
                      Open Tool ↗
                    </a>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--sa-muted)', opacity: 0.6 }}>
                Source: {g.source}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Email Templates ── */}
      {activeSection === 'emails' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            7 email templates via Resend API. Preview shows the template source location.
          </div>
          {EMAIL_TEMPLATES.map(t => (
            <div key={t.id} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <div className="sa-rowTitle">{t.name}</div>
              <div className="sa-rowSub">{t.desc}</div>
              <div style={{ fontSize: 10, color: 'var(--sa-muted)', opacity: 0.6, fontFamily: 'monospace' }}>
                {t.source}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WhatsApp Templates ── */}
      {activeSection === 'whatsapp' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            3 follow-up message templates for post-purchase WhatsApp engagement.
          </div>
          {WA_TEMPLATES.map(t => (
            <div key={t.id} className="sa-row">
              <div>
                <div className="sa-rowTitle">{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--sa-muted)', opacity: 0.6, fontFamily: 'monospace' }}>{t.source}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Test Fixture PDFs ── */}
      {activeSection === 'fixtures' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            Sample PDFs used for testing the ITR extraction pipeline.
          </div>
          {TEST_PDFS.map(f => (
            <div key={f.path} className="sa-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sa-rowTitle">{f.name}</div>
              <a
                href={f.path}
                download
                className="sa-miniBtn sa-miniBtnActive"
                style={{ textDecoration: 'none' }}
              >
                Download ↓
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
