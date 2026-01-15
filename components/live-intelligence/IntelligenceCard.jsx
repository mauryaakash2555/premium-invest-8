'use client';

/**
 * IntelligenceCard - Renders a single intelligence item with 6 mandatory blocks
 * 
 * CONTENT STRUCTURE (MANDATORY & ORDERED):
 * 1. What happened - Pure facts only, past/present tense
 * 2. Why it matters - Educational, NO advice, NO future tense
 * 3. Where this fits - Category context only
 * 4. Who should care - Persona-level only
 * 5. Related signals - Internal system signals ONLY
 * 6. Source + timestamp
 * 
 * ❌ No extra blocks
 * ❌ No reordering  
 * ❌ No opinions
 */

import { useMemo } from 'react';

// Urgency color mapping
const urgencyColors = {
  critical: { bg: 'rgba(255, 100, 100, 0.12)', border: 'rgba(255, 100, 100, 0.30)', text: 'rgba(255, 140, 140, 0.95)' },
  high: { bg: 'rgba(255, 180, 100, 0.12)', border: 'rgba(255, 180, 100, 0.30)', text: 'rgba(255, 200, 140, 0.95)' },
  medium: { bg: 'rgba(100, 180, 255, 0.12)', border: 'rgba(100, 180, 255, 0.30)', text: 'rgba(140, 200, 255, 0.95)' },
  low: { bg: 'rgba(140, 220, 180, 0.12)', border: 'rgba(140, 220, 180, 0.30)', text: 'rgba(160, 230, 190, 0.95)' },
};

// Category icons
const categoryIcons = {
  market_update: '📊',
  policy_change: '📜',
  economic_indicator: '📈',
  corporate_action: '🏢',
  global_market: '🌐',
  commodity: '💎',
  currency: '💱',
  regulatory: '⚖️',
};

export default function IntelligenceCard({ item, isExpanded = false }) {
  const urgency = urgencyColors[item.urgency] || urgencyColors.low;
  const icon = categoryIcons[item.category] || '📰';

  const signals = useMemo(() => {
    if (Array.isArray(item.block_signals)) return item.block_signals;
    if (typeof item.block_signals === 'string') {
      try {
        return JSON.parse(item.block_signals);
      } catch {
        return [];
      }
    }
    return [];
  }, [item.block_signals]);

  return (
    <article
      className="li-intelligence-card"
      style={{
        background: 'linear-gradient(180deg, rgba(18, 22, 30, 0.95) 0%, rgba(10, 10, 12, 0.98) 100%)',
        border: `1px solid ${urgency.border}`,
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Header with category and urgency */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(170, 198, 255, 0.70)',
          }}>
            {item.category?.replace(/_/g, ' ')}
          </span>
        </div>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          background: urgency.bg,
          color: urgency.text,
          border: `1px solid ${urgency.border}`,
        }}>
          {item.urgency}
        </span>
      </div>

      {/* Block 1: What Happened */}
      <div className="li-block" style={{ marginBottom: '16px' }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: 'rgba(235, 245, 255, 0.95)',
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          {item.block_what_happened}
        </h3>
      </div>

      {/* Block 2: Why It Matters (Educational) */}
      <div className="li-block" style={{
        marginBottom: '16px',
        padding: '14px 16px',
        background: 'rgba(100, 160, 255, 0.06)',
        borderRadius: '12px',
        borderLeft: '3px solid rgba(100, 160, 255, 0.40)',
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(140, 190, 255, 0.80)',
          marginBottom: '8px',
        }}>
          Why It Matters
        </div>
        <p style={{
          margin: 0,
          color: 'rgba(200, 215, 240, 0.85)',
          fontSize: '14px',
          lineHeight: 1.6,
        }}>
          {item.block_why_it_matters}
        </p>
      </div>

      {/* Block 3: Where This Fits */}
      <div className="li-block" style={{ marginBottom: '14px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(170, 198, 255, 0.60)',
          marginBottom: '6px',
        }}>
          Where This Fits
        </div>
        <p style={{
          margin: 0,
          color: 'rgba(200, 215, 240, 0.75)',
          fontSize: '13px',
          lineHeight: 1.5,
        }}>
          {item.block_where_fits}
        </p>
      </div>

      {/* Block 4: Who Should Care */}
      <div className="li-block" style={{ marginBottom: '14px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(170, 198, 255, 0.60)',
          marginBottom: '6px',
        }}>
          Who Should Care
        </div>
        <p style={{
          margin: 0,
          color: 'rgba(200, 215, 240, 0.75)',
          fontSize: '13px',
          lineHeight: 1.5,
        }}>
          {item.block_who_cares}
        </p>
      </div>

      {/* Block 5: Related Signals */}
      {signals.length > 0 && (
        <div className="li-block" style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(170, 198, 255, 0.60)',
            marginBottom: '8px',
          }}>
            Related Signals
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {signals.map((signal, idx) => (
              <span
                key={signal.key || idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(140, 220, 180, 0.08)',
                  border: '1px solid rgba(140, 220, 180, 0.20)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'rgba(160, 230, 190, 0.90)',
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'rgba(140, 220, 180, 0.80)',
                }} />
                {signal.label || signal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Block 6: Source + Timestamp */}
      <div className="li-block" style={{
        paddingTop: '12px',
        borderTop: '1px solid rgba(170, 198, 255, 0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span style={{
            color: 'rgba(170, 198, 255, 0.50)',
            fontSize: '11px',
          }}>
            {item.block_source_timestamp}
          </span>
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(140, 190, 255, 0.70)',
                fontSize: '11px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              View source →
            </a>
          )}
        </div>
      </div>

      <style jsx>{`
        .li-intelligence-card:hover {
          border-color: rgba(170, 198, 255, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.40), 0 0 40px rgba(100, 160, 255, 0.08);
        }
      `}</style>
    </article>
  );
}

// Export for use in feed components
export { IntelligenceCard };
