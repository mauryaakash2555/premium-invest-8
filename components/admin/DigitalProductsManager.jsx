'use client';

/**
 * DigitalProductsManager — Admin panel to preview & download all paid digital content.
 * Shows PDFs, email templates inline, WhatsApp messages, store products.
 * Mobile-first LUX theme.
 */

import { useCallback, useState } from 'react';

/* ─── Store Products (static) ─── */
const STORE_PRODUCTS = [
  { slug: 'basics-of-personal-finance-pdf', name: 'Basics of Personal Finance', price: 99, type: 'PDF', about: 'Beginner guide covering budgeting, saving, emergency fund, insurance basics, and first steps to investing.' },
  { slug: 'tax-planning-checklist-pdf', name: 'Tax Planning Checklist', price: 149, type: 'PDF', about: 'Section 80C/80D/80E deductions checklist, HRA, NPS, regime comparison worksheet for FY 2025-26.' },
  { slug: 'monthly-savings-toolkit-pdf', name: 'Monthly Savings Toolkit', price: 199, type: 'PDF', about: 'Excel + PDF: monthly expense tracker, 50/30/20 budget planner, SIP auto-debit schedule template.' },
  { slug: 'tax-optimization-pdf', name: 'ITR Filing Summary (Form 16)', price: 0, type: 'PDF (Free)', about: 'Premium A4 with salary breakdown, regime comparison, deductions, filing guide. Auto-generated from Form 16.' },
  { slug: 'property-vs-sip-pdf', name: 'Property vs SIP Report', price: 299, type: 'PDF', about: '15-year wealth comparison: property appreciation+rental vs SIP XIRR. Includes stamp duty, interest, maintenance costs.' },
  { slug: 'form-16-tax-leak-checklist', name: 'Form 16 Tax Leak Checklist', price: 149, type: 'PDF + Checklist', about: 'Spot unclaimed deductions in your Form 16: NPS, home loan, medical, donations, 80G, leave encashment.' },
  { slug: 'mumbai-tax-leak-playbook', name: 'Mumbai High-Income Playbook', price: 249, type: 'Guide', about: 'Mumbai-specific strategies: HRA optimisation, property vs rent math, capital gains harvesting, professional income.' },
  { slug: 'sip-vs-panic-workbook', name: 'SIP vs Panic Workbook', price: 199, type: 'Excel + PDF', about: 'Behavioral simulation: SIP discipline vs panic-selling during 5 crash scenarios. Includes interactive Excel model.' },
  { slug: 'wealth-blueprint-starter-kit', name: 'Wealth Blueprint Starter Kit', price: 399, type: 'Templates + Guide', about: 'Complete starter bundle: budget template, SIP planner, insurance audit, tax checklist, goal-mapping worksheet.' },
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
    preview: [
      'Header: BM Wealth logo + "Income Tax Filing Summary FY 2025-26"',
      'Section 1: Salary Breakdown (Gross, HRA, Std Deduction, Net Taxable)',
      'Section 2: Old vs New Regime Comparison table',
      'Section 3: Deductions Used (80C, 80D, NPS, HRA)',
      'Section 4: Step-by-step ITR Filing Guide',
      'Footer: ARN 90008 / IRDAI 277925 disclaimer',
    ],
  },
  {
    id: 'daily-market',
    name: 'Daily Market Summary PDF',
    desc: 'Auto-generated A4 with NIFTY/SENSEX/BankNIFTY, FII/DII, 6 headlines, QR code.',
    fileName: null,
    generatorType: 'client',
    source: 'lib/live-intelligence/pdfGenerator.js',
    preview: [
      'Header: BM Wealth + date + "Daily Market Intelligence"',
      'Row 1: NIFTY 50, SENSEX, Bank NIFTY — price + % change badges',
      'Row 2: FII/DII activity (net buy/sell ₹ crore)',
      'Section: Top 6 curated headlines with source attribution',
      'Footer: QR code → bmwealth.co.in/live-intelligence',
      'Disclaimer: Educational awareness only, not investment advice',
    ],
  },
  {
    id: 'sip-panic-report',
    name: 'SIP vs Panic Report PDF',
    desc: 'Investment simulation showing discipline vs panic selling, behavioral cost analysis.',
    fileName: null,
    generatorType: 'client',
    source: 'intelligence/ui/sip-panic/DownloadReport.tsx',
    preview: [
      'Header: "SIP vs Panic Selling — Behavioral Cost Analysis"',
      'Chart: Month-by-month portfolio value (SIP vs panic-sell)',
      'Table: 5 crash scenarios with recovery timeline',
      'Key Insight: Total wealth gap from panic decisions',
      'Footer: "Discipline compounds, panic costs" + disclaimer',
    ],
  },
];

/* ─── Email Templates with inline content preview ─── */
const EMAIL_TEMPLATES = [
  {
    id: 'property-sip-free',
    name: 'Property vs SIP — Free Summary Email',
    desc: 'Rich "You\'re losing ₹XCr" email with tracking pixel, daily leak numbers, CTA button.',
    source: 'lib/email/propertyVsSipTemplates.js → buildPropertyVsSipFreeSummaryEmail',
    format: {
      subject: 'You\'re losing ₹{gap}Cr. Here\'s how.',
      sections: ['Wealth gap headline (SIP vs property)', 'Daily/monthly/yearly "leak" amounts', 'CTA: "See your full report" → /tools/property-vs-sip', 'Open-tracking pixel'],
      style: 'Dark gold theme, responsive HTML, mobile-optimised',
    },
  },
  {
    id: 'property-sip-paid',
    name: 'Property vs SIP — Paid PDF Delivery Email',
    desc: 'Payment confirmation + PDF attachment delivery with WhatsApp contact.',
    source: 'lib/email/propertyVsSipTemplates.js → buildPropertyVsSipPaidPdfEmail',
    format: {
      subject: 'Your Property Report — ₹{gap}Cr analysis',
      sections: ['Payment confirmation', '3 bullet insights: property grows slower / SIP compounds faster / exit options', 'PDF attached', 'WhatsApp: +91 88509 77259', 'Disclaimer: Calculator, not advice. ARN 90008'],
      style: 'Dark gold theme, responsive HTML',
    },
  },
  {
    id: 'tax-blueprint-paid',
    name: 'Tax Blueprint — Paid PDF Email',
    desc: 'Old vs New regime comparison result + PDF attachment.',
    source: 'lib/email/taxBlueprintTemplates.js → buildTaxBlueprintPaidPdfEmail',
    format: {
      subject: 'Your Tax Optimization Blueprint is Ready!',
      sections: ['Payment confirmed for "BM Wealth Tax Optimization Intelligence (FY 2025-26)"', 'Optimal regime + estimated savings shown', 'PDF attached', 'Footer: ARN 90008 / IRDAI 277925'],
      style: 'Dark gold theme, responsive HTML',
    },
  },
  {
    id: 'tax-followup-1',
    name: 'Tax Optimization Follow-up (Step 1)',
    desc: '2-step drip: "Next steps" email after tool use.',
    source: 'lib/email/taxOptimizationFollowupTemplates.js',
    format: {
      subject: 'Your Tax Optimization next steps',
      sections: ['Checklist: Confirm regime, Spot missing deductions, Monthly action plan', 'CTA: Execution partners page', 'Footer: ARN 90008'],
      style: 'Inter font, dark with black CTA button',
    },
  },
  {
    id: 'tax-followup-2',
    name: 'Tax Optimization Follow-up (Step 2)',
    desc: '2-step drip: Reminder email.',
    source: 'lib/email/taxOptimizationFollowupTemplates.js',
    format: {
      subject: 'Quick reminder: want us to optimise your tax plan?',
      sections: ['Short nudge text', 'Same CTA as Step 1', 'Footer: ARN 90008'],
      style: 'Inter font, dark with black CTA button',
    },
  },
  {
    id: 'hot-lead-alert',
    name: 'Hot Lead Alert (Internal)',
    desc: 'Internal alert when a high-score lead comes in.',
    source: 'lib/email/emailService.js → sendHotLeadAlert',
    format: {
      subject: 'HOT LEAD: {name}',
      sections: ['Name, Email, Phone, Score (e.g. 85/100 HOT)', 'Timestamp', 'Last message preview', 'CTA: "View in Dashboard"'],
      style: 'Internal alert, minimal HTML',
    },
  },
  {
    id: 'daily-summary',
    name: 'Daily Summary (Internal)',
    desc: 'Daily KPI digest email.',
    source: 'lib/email/emailService.js → sendDailySummary',
    format: {
      subject: 'Daily Summary — {date}',
      sections: ['Table: Leads Captured, Hot Leads, Conversations, Revenue (₹), Affiliate Clicks', 'Top Questions list', 'CTA: "View Full Dashboard"'],
      style: 'Internal digest table, minimal HTML',
    },
  },
];

/* ─── WhatsApp Templates with actual message content ─── */
const WA_TEMPLATES = [
  {
    id: 'wa-instant',
    name: 'After Purchase — Instant',
    source: 'lib/templates/whatsappFollowups.js',
    message: 'Hi {name} 👋\n\nYour BM Wealth Tax Execution Blueprint (FY 2025–26) is ready.\nDownload link is in your email.\n\nIf anything is unclear, just reply here.',
  },
  {
    id: 'wa-24h',
    name: 'After Purchase — 24 Hours',
    source: 'lib/templates/whatsappFollowups.js',
    message: 'Hi {name} — quick check.\n\nDid you see the month-by-month section?\nThat\'s where most people realise what they were missing.',
  },
  {
    id: 'wa-5-7d',
    name: 'After Purchase — 5-7 Days',
    source: 'lib/templates/whatsappFollowups.js',
    message: 'Hi {name}\n\nMany clients use this once and forget it.\nSome review it mid-year and fix things properly.\n\nIf you want a quick sanity check, reply REVIEW.',
  },
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
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);

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

  const infoBoxStyle = {
    marginTop: 8,
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(214,179,106,0.04)',
    border: '1px solid rgba(214,179,106,0.12)',
    fontSize: 12,
    lineHeight: 1.7,
    color: 'var(--sa-muted)',
  };

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

      {/* ── Store Products with inline content preview ── */}
      {activeSection === 'products' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            {STORE_PRODUCTS.length} products in catalog. Tap a product to see what&apos;s inside.
          </div>
          {STORE_PRODUCTS.map(p => (
            <div key={p.slug} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, cursor: 'pointer' }} onClick={() => setExpandedProduct(expandedProduct === p.slug ? null : p.slug)}>
                  <div className="sa-rowTitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, opacity: 0.5 }}>{expandedProduct === p.slug ? '▼' : '▶'}</span>
                    {p.name}
                  </div>
                  <div className="sa-rowSub">{p.type} — {p.price > 0 ? `₹${p.price}` : 'Free'}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <a
                    href={`/store/products/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sa-miniBtn sa-miniBtnActive"
                    style={{ textDecoration: 'none' }}
                  >
                    Preview Page ↗
                  </a>
                </div>
              </div>
              {expandedProduct === p.slug && (
                <div style={infoBoxStyle}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: 'rgba(214,179,106,0.9)' }}>What&apos;s Inside:</div>
                  {p.about}
                </div>
              )}
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

      {/* ── PDF Generators with inline structure preview ── */}
      {activeSection === 'pdfs' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {PDF_GENERATORS.map(g => (
            <div key={g.id} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setPdfPreview(pdfPreview === g.id ? null : g.id)}>
                  <div className="sa-rowTitle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, opacity: 0.5 }}>{pdfPreview === g.id ? '▼' : '▶'}</span>
                    {g.name}
                  </div>
                  <div className="sa-rowSub">{g.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {g.staticPath && (
                    <a href={g.staticPath} target="_blank" rel="noopener noreferrer" className="sa-miniBtn sa-miniBtnActive" style={{ textDecoration: 'none' }}>
                      View PDF ↗
                    </a>
                  )}
                  {g.staticPath && (
                    <a href={g.staticPath} download className="sa-miniBtn" style={{ textDecoration: 'none' }}>
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
                    <a href="/intelligence/sip-vs-panic" target="_blank" rel="noopener noreferrer" className="sa-miniBtn" style={{ textDecoration: 'none' }}>
                      Open Tool ↗
                    </a>
                  )}
                </div>
              </div>
              {pdfPreview === g.id && g.preview && (
                <div style={infoBoxStyle}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: 'rgba(214,179,106,0.9)' }}>PDF Structure:</div>
                  {g.preview.map((line, i) => (
                    <div key={i} style={{ paddingLeft: 8, borderLeft: '2px solid rgba(214,179,106,0.15)', marginBottom: 4 }}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--sa-muted)', opacity: 0.6 }}>
                Source: {g.source}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Email Templates with inline format preview ── */}
      {activeSection === 'emails' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            {EMAIL_TEMPLATES.length} email templates via Resend API. Tap to see format & content.
          </div>
          {EMAIL_TEMPLATES.map(t => (
            <div key={t.id} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6, cursor: 'pointer' }}
              onClick={() => setExpandedEmail(expandedEmail === t.id ? null : t.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, opacity: 0.5 }}>{expandedEmail === t.id ? '▼' : '▶'}</span>
                <div style={{ flex: 1 }}>
                  <div className="sa-rowTitle">{t.name}</div>
                  <div className="sa-rowSub">{t.desc}</div>
                </div>
              </div>
              {expandedEmail === t.id && t.format && (
                <div style={infoBoxStyle} onClick={e => e.stopPropagation()}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: 'rgba(214,179,106,0.9)' }}>Subject: </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{t.format.subject}</span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: 'rgba(214,179,106,0.9)' }}>Email Sections:</div>
                  {t.format.sections.map((s, i) => (
                    <div key={i} style={{ paddingLeft: 8, borderLeft: '2px solid rgba(214,179,106,0.15)', marginBottom: 3 }}>
                      {s}
                    </div>
                  ))}
                  <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>
                    Style: {t.format.style}
                  </div>
                </div>
              )}
              <div style={{ fontSize: 10, color: 'var(--sa-muted)', opacity: 0.6, fontFamily: 'monospace' }}>
                {t.source}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WhatsApp Templates with actual message content ── */}
      {activeSection === 'whatsapp' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--sa-muted)', marginBottom: 4 }}>
            {WA_TEMPLATES.length} follow-up message templates for post-purchase WhatsApp engagement.
          </div>
          {WA_TEMPLATES.map(t => (
            <div key={t.id} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <div className="sa-rowTitle">{t.name}</div>
              <div style={{
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(37,211,102,0.04)',
                border: '1px solid rgba(37,211,102,0.15)',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)',
                whiteSpace: 'pre-line',
                fontFamily: 'system-ui, sans-serif',
              }}>
                {t.message}
              </div>
              <div style={{ fontSize: 10, color: 'var(--sa-muted)', opacity: 0.6, fontFamily: 'monospace' }}>{t.source}</div>
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
              <div style={{ display: 'flex', gap: 6 }}>
                <a href={f.path} target="_blank" rel="noopener noreferrer" className="sa-miniBtn sa-miniBtnActive" style={{ textDecoration: 'none' }}>
                  View ↗
                </a>
                <a href={f.path} download className="sa-miniBtn" style={{ textDecoration: 'none' }}>
                  Download ↓
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
