'use client';

import { useEffect, useState } from 'react';

const panelStyle = {
  borderRadius: 0,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

export default function RevenueDashboardPage() {
  const [adminToken, setAdminToken] = useState('');
  const [stats, setStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    sponsoredPosts: 0,
    affiliateClicks: 0,
    newsletterSubs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const t = window.localStorage.getItem('ADMIN_TOKEN') || '';
      setAdminToken(t);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/stats', {
          cache: 'no-store',
          headers: adminToken ? { 'x-admin-token': adminToken } : undefined,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || 'Stats failed');
        if (!cancelled) setStats(json || {});
      } catch (e) {
        if (!cancelled) setError((e && e.message) || 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [adminToken]);

  const est = {
    affiliates: Number(stats.affiliateClicks || 0) * 50,
    sponsored: Number(stats.sponsoredPosts || 0) * 25000,
    newsletter: Number(stats.newsletterSubs || 0) * 99,
  };
  const total = est.affiliates + est.sponsored + est.newsletter;

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
            color: 'oklch(0.72 0.10 240)',
          }}
        >
          Revenue Dashboard
        </h1>

        <div style={{ marginBottom: '18px' }}>
          <div style={{ color: 'oklch(0.72 0.10 240)', fontWeight: 700, marginBottom: '8px' }}>Admin Token (Optional)</div>
          <input
            value={adminToken}
            onChange={(e) => {
              const v = e.target.value;
              setAdminToken(v);
              try {
                window.localStorage.setItem('ADMIN_TOKEN', v);
              } catch {}
            }}
            placeholder="Set ADMIN_TOKEN if enabled"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(0,0,0,0.65)',
              color: 'rgba(235,242,255,0.92)',
              outline: 'none',
            }}
          />
        </div>

        {error ? <div style={{ ...panelStyle, padding: '14px', color: 'rgba(235,242,255,0.86)' }}>{error}</div> : null}

        <div className="grid md:grid-cols-3 gap-4" style={{ marginTop: '14px', marginBottom: '18px' }}>
          <div style={{ ...panelStyle, padding: '14px' }}>
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Total Views</div>
            <div style={{ color: 'rgba(245,245,245,0.92)', fontSize: '28px', fontWeight: 800 }}>
              {isLoading ? '…' : Number(stats.totalViews || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ ...panelStyle, padding: '14px' }}>
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Sponsored Posts</div>
            <div style={{ color: 'rgba(245,245,245,0.92)', fontSize: '28px', fontWeight: 800 }}>
              {isLoading ? '…' : Number(stats.sponsoredPosts || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ ...panelStyle, padding: '14px' }}>
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Newsletter Subs</div>
            <div style={{ color: 'rgba(245,245,245,0.92)', fontSize: '28px', fontWeight: 800 }}>
              {isLoading ? '…' : Number(stats.newsletterSubs || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ ...panelStyle, padding: '14px' }}>
          <div style={{ color: 'rgba(245,245,245,0.92)', fontWeight: 800, marginBottom: '10px' }}>Estimated Monthly Revenue</div>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>
            Rough estimates (adjust multipliers as you finalize pricing).
          </div>
          <div style={{ color: 'rgba(235,242,255,0.86)', lineHeight: 1.9 }}>
            <div>Affiliates: ₹{est.affiliates.toLocaleString()}</div>
            <div>Sponsored: ₹{est.sponsored.toLocaleString()}</div>
            <div>Newsletter: ₹{est.newsletter.toLocaleString()}</div>
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.10)', color: 'oklch(0.72 0.10 240)', fontWeight: 900 }}>
              Total: ₹{total.toLocaleString()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
