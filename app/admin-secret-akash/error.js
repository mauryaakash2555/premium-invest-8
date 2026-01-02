'use client';

export default function Error({ error, reset }) {
  const message = String(error?.message || 'Unknown error');

  return (
    <div style={{ padding: 18 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>Admin page crashed</h2>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        This is a client-side runtime error. Click Retry to re-render.
      </p>
      <button
        onClick={() => reset()}
        style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' }}
      >
        Retry
      </button>
      <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', opacity: 0.85 }}>{message}</pre>
    </div>
  );
}
