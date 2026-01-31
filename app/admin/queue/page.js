'use client';

import { useEffect, useMemo, useState } from 'react';

const panelStyle = {
  borderRadius: 0,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

export default function AdminQueuePage() {
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [enhanced, setEnhanced] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState('');

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/proxy-queue', { cache: 'no-store' });
      const json = await res.json();
      setPending(Array.isArray(json) ? json : []);
    } catch {
      setPending([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const selectedId = selected?._id;
  const canApprove = useMemo(() => {
    return Boolean(selectedId && String(enhanced || '').trim().length >= 20);
  }, [selectedId, enhanced]);

  const approve = async () => {
    if (!canApprove) return;
    setActionStatus('approving');
    try {
      const res = await fetch(`/api/proxy-approve/${encodeURIComponent(selectedId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_enhanced: enhanced }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && json.success === false)) throw new Error('Approve failed');
      setActionStatus('approved');
      setSelected(null);
      setEnhanced('');
      await refresh();
    } catch {
      setActionStatus('approve-error');
    }
  };

  const reject = async () => {
    if (!selectedId) return;
    setActionStatus('rejecting');
    try {
      const res = await fetch(`/api/proxy-reject/${encodeURIComponent(selectedId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by admin' }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && json.success === false)) throw new Error('Reject failed');
      setActionStatus('rejected');
      setSelected(null);
      setEnhanced('');
      await refresh();
    } catch {
      setActionStatus('reject-error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <section className="section-container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <h1
          style={{
            fontSize: 'clamp(24px, 3.2vw, 38px)',
            marginBottom: '18px',
            fontWeight: 300,
            letterSpacing: '2px',
            fontFamily: '"Playfair Display", serif',
            color: 'var(--lux-accent)',
          }}
        >
          Approval Queue {isLoading ? '' : `(${pending.length})`}
        </h1>

        <div style={{ display: 'grid', gap: '22px', gridTemplateColumns: '1fr', alignItems: 'start' }} className="md:grid md:grid-cols-2">
          <div style={{ display: 'grid', gap: '12px' }}>
            {isLoading ? (
              <div style={{ ...panelStyle, padding: '14px', color: 'rgba(235,242,255,0.86)' }}>Loading…</div>
            ) : pending.length === 0 ? (
              <div style={{ ...panelStyle, padding: '14px', color: 'rgba(235,242,255,0.86)' }}>No pending submissions.</div>
            ) : (
              pending.map((post) => (
                <div
                  key={post._id}
                  onClick={() => {
                    setSelected(post);
                    setEnhanced(post.content_original || '');
                    setActionStatus('');
                  }}
                  style={{
                    ...panelStyle,
                    padding: '14px',
                    cursor: 'pointer',
                    borderColor: selected?._id === post._id ? 'color-mix(in oklab, var(--lux-accent) 40%, transparent)' : 'rgba(255,255,255,0.14)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ color: 'rgba(245,245,245,0.92)', fontWeight: 700 }}>{post.title}</div>
                      <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>{post.author_name}</div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>{post.pillar}</div>
                  </div>

                  {post.location_tag ? (
                    <div style={{ marginTop: '8px', color: 'color-mix(in oklab, var(--lux-accent) 70%, #999)', fontSize: '13px' }}>
                      📍 {post.location_tag}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {!selected ? (
              <div style={{ ...panelStyle, padding: '14px', color: 'rgba(235,242,255,0.86)' }}>Select a post to review.</div>
            ) : (
              <>
                <div style={{ ...panelStyle, padding: '14px' }}>
                  <div style={{ color: 'var(--lux-accent)', fontWeight: 700, marginBottom: '8px' }}>Original</div>
                  <div style={{ color: 'rgba(235,242,255,0.86)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {selected.content_original}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--lux-accent)', fontWeight: 700, marginBottom: '8px' }}>Enhanced Version</div>
                  <textarea
                    value={enhanced}
                    onChange={(e) => setEnhanced(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '260px',
                      padding: '14px',
                      borderRadius: 0,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(0,0,0,0.65)',
                      color: 'rgba(235,242,255,0.92)',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={approve}
                    disabled={!canApprove || actionStatus === 'approving'}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 0,
                      border: '1px solid rgba(34,197,94,0.45)',
                      background: 'rgba(34,197,94,0.12)',
                      color: 'rgba(235,242,255,0.92)',
                      fontWeight: 800,
                      cursor: !canApprove || actionStatus === 'approving' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {actionStatus === 'approving' ? 'Approving…' : 'Approve & Publish'}
                  </button>

                  <button
                    onClick={reject}
                    disabled={actionStatus === 'rejecting'}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: 0,
                      border: '1px solid rgba(239,68,68,0.45)',
                      background: 'rgba(239,68,68,0.12)',
                      color: 'rgba(235,242,255,0.92)',
                      fontWeight: 800,
                      cursor: actionStatus === 'rejecting' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {actionStatus === 'rejecting' ? 'Rejecting…' : 'Reject'}
                  </button>
                </div>

                {actionStatus === 'approved' ? (
                  <div style={{ color: 'rgba(235,242,255,0.86)' }}>Approved.</div>
                ) : null}
                {actionStatus === 'rejected' ? (
                  <div style={{ color: 'rgba(235,242,255,0.86)' }}>Rejected.</div>
                ) : null}
                {actionStatus === 'approve-error' ? (
                  <div style={{ color: 'rgba(235,242,255,0.86)' }}>Approve failed.</div>
                ) : null}
                {actionStatus === 'reject-error' ? (
                  <div style={{ color: 'rgba(235,242,255,0.86)' }}>Reject failed.</div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
