'use client';

import type { CSSProperties } from 'react';

const DESK_NAME = process.env.NEXT_PUBLIC_WEALTH_DESK_NAME || 'Wealth Desk';
const DESK_TITLE = process.env.NEXT_PUBLIC_WEALTH_DESK_TITLE || 'PMS Distribution Support';
const DESK_WHATSAPP = process.env.NEXT_PUBLIC_WEALTH_DESK_WHATSAPP || '';
const DESK_PHONE = process.env.NEXT_PUBLIC_WEALTH_DESK_PHONE || '';
const DESK_EMAIL = process.env.NEXT_PUBLIC_WEALTH_DESK_EMAIL || '';

function normalizeWhatsapp(value: string): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  // Accept either full URL or digits.
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits}`;
}

export default function WealthDeskPanel(props: { style?: CSSProperties }) {
  const wa = normalizeWhatsapp(DESK_WHATSAPP);
  const tel = DESK_PHONE ? `tel:${String(DESK_PHONE).replace(/\s+/g, '')}` : '';
  const mail = DESK_EMAIL ? `mailto:${DESK_EMAIL}` : '';

  const hasDirect = Boolean(wa || tel || mail);

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,175,55,0.14)',
        ...props.style,
      }}
      aria-label="Wealth desk"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
            White-glove support
          </div>
          <div style={{ marginTop: 4, color: 'rgba(245,248,255,0.92)', fontSize: 13, fontWeight: 950 }}>
            {DESK_NAME}
          </div>
          <div style={{ marginTop: 2, color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
            {DESK_TITLE}
          </div>
        </div>
        <div style={{
          padding: '6px 10px',
          borderRadius: 10,
          background: 'rgba(10,10,12,0.50)',
          border: '1px solid rgba(212,175,55,0.22)',
          color: 'rgba(212,175,55,0.85)',
          fontSize: 11,
          fontWeight: 900,
        }}>
          Priority access
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 12,
              background: 'rgba(140,220,180,0.12)',
              border: '1px solid rgba(140,220,180,0.20)',
              color: 'rgba(245,248,255,0.92)',
              fontSize: 12,
              fontWeight: 900,
              textDecoration: 'none',
            }}
          >
            WhatsApp
            <span style={{ fontSize: 11, opacity: 0.8 }}>↗</span>
          </a>
        ) : null}

        {tel ? (
          <a
            href={tel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 12,
              background: 'rgba(170,198,255,0.10)',
              border: '1px solid rgba(170,198,255,0.16)',
              color: 'rgba(245,248,255,0.92)',
              fontSize: 12,
              fontWeight: 900,
              textDecoration: 'none',
            }}
          >
            Call
          </a>
        ) : null}

        {mail ? (
          <a
            href={mail}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(235,242,255,0.88)',
              fontSize: 12,
              fontWeight: 900,
              textDecoration: 'none',
            }}
          >
            Email
          </a>
        ) : null}

        <a
          href="/contact?subject=Wealth%20Desk%20Support"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 12px',
            borderRadius: 12,
            background: 'rgba(10,10,12,0.55)',
            border: '1px solid rgba(212,175,55,0.14)',
            color: 'rgba(235,242,255,0.88)',
            fontSize: 12,
            fontWeight: 900,
            textDecoration: 'none',
          }}
        >
          Schedule
          <span style={{ fontSize: 11, opacity: 0.8 }}>↗</span>
        </a>
      </div>

      <div style={{ marginTop: 10, color: 'rgba(200,215,240,0.40)', fontSize: 11, lineHeight: 1.4 }}>
        {hasDirect ? 'Direct lines are configured for staging/prod.' : 'Configure direct WhatsApp/phone/email via NEXT_PUBLIC_WEALTH_DESK_* env vars.'}
      </div>
    </div>
  );
}
