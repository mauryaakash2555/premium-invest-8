'use client';

export default function TodaysLens({ lens }) {
  if (!lens) return null;

  return (
    <section
      aria-label="Today’s Lens"
      style={{
        padding: '14px 16px',
        borderRadius: '16px',
        border: '1px solid rgba(150, 170, 200, 0.12)',
        background: 'rgba(0, 0, 0, 0.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span aria-hidden="true" style={{ opacity: 0.9 }}>
            🔍
          </span>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(170, 185, 210, 0.68)',
              }}
            >
              Today’s Lens
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(235, 242, 255, 0.92)',
                marginTop: '2px',
              }}
            >
              {lens.title}
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(170, 185, 210, 0.78)', maxWidth: '860px' }}>
        {lens.body}
      </div>

      {lens.prompt ? (
        <div
          style={{
            marginTop: '10px',
            fontSize: '12px',
            color: 'rgba(160, 175, 200, 0.72)',
            borderTop: '1px solid rgba(150, 170, 200, 0.10)',
            paddingTop: '10px',
          }}
        >
          <span style={{ color: 'rgba(200, 210, 230, 0.75)', fontWeight: 600 }}>Try this:</span> {lens.prompt}
        </div>
      ) : null}
    </section>
  );
}
