'use client';

export default function PanelSkeleton({ rows = 2, columns = 2 }) {
  const gridTemplateColumns = `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`;

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
      }}
      aria-label="Loading"
      aria-busy="true"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="li-skeleton" style={{ height: '12px', width: '120px', borderRadius: '8px' }} />
          <div className="li-skeleton" style={{ marginTop: '8px', height: '10px', width: '160px', borderRadius: '8px' }} />
        </div>
        <div className="li-skeleton" style={{ height: '10px', width: '70px', borderRadius: '8px' }} />
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns, gap: '10px' }}>
        {Array.from({ length: Math.max(1, rows) * Math.max(1, columns) }).map((_, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 12px',
              borderRadius: '12px',
              background: 'rgba(10,10,12,0.45)',
              border: '1px solid rgba(170,198,255,0.10)',
            }}
          >
            <div className="li-skeleton" style={{ height: '10px', width: '70px', borderRadius: '8px' }} />
            <div className="li-skeleton" style={{ marginTop: '10px', height: '18px', width: '120px', borderRadius: '10px' }} />
          </div>
        ))}
      </div>

      <div className="li-skeleton" style={{ marginTop: '10px', height: '10px', width: '200px', borderRadius: '8px' }} />
    </div>
  );
}
