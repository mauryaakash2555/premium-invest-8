'use client';

export default function SubmitError({ error, reset }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <section className="section-container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <h1 style={{ color: 'var(--lux-accent)', fontFamily: '"Playfair Display", serif', fontWeight: 300, letterSpacing: '2px' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'rgba(235,242,255,0.86)', marginTop: '12px' }}>
          {error?.message || 'Please try again.'}
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '18px',
            padding: '12px 14px',
            borderRadius: 0,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(235,242,255,0.92)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </section>
    </div>
  );
}
