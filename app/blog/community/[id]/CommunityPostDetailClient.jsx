'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const panelStyle = {
  borderRadius: 0,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

export default function CommunityPostDetailClient({ id }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEnhanced, setShowEnhanced] = useState(true);

  const safeId = useMemo(() => (typeof id === 'string' ? id : ''), [id]);

  useEffect(() => {
    if (!safeId) return;
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/post/${encodeURIComponent(safeId)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || 'Failed to load');
        if (!cancelled) setPost(json);
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
  }, [safeId]);

  useEffect(() => {
    if (!safeId) return;
    fetch(`/api/track-view/${encodeURIComponent(safeId)}`, { method: 'POST' }).catch(() => null);
  }, [safeId]);

  const content = useMemo(() => {
    if (!post) return '';
    const hasEnhanced = Boolean(String(post.content_enhanced || '').trim());
    if (!hasEnhanced) return String(post.content_original || '');
    return showEnhanced ? String(post.content_enhanced || '') : String(post.content_original || '');
  }, [post, showEnhanced]);

  const onAffiliateClick = async (e) => {
    if (!post?.affiliate_link) return;
    e.preventDefault();
    try {
      await fetch(`/api/track-affiliate-click/${encodeURIComponent(safeId)}`, { method: 'POST' });
    } catch {}
    window.open(post.affiliate_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <section className="section-container" style={{ paddingTop: '120px', paddingBottom: '60px', maxWidth: '980px' }}>
        <Link href="/blog" style={{ color: 'rgba(235,242,255,0.86)', textDecoration: 'none' }}>
          ← Back to Blog
        </Link>

        {isLoading ? <div style={{ ...panelStyle, padding: '14px', marginTop: '14px', color: 'rgba(235,242,255,0.86)' }}>Loading…</div> : null}
        {error ? <div style={{ ...panelStyle, padding: '14px', marginTop: '14px', color: 'rgba(235,242,255,0.86)' }}>{error}</div> : null}

        {post ? (
          <>
            {post.sponsored_by ? (
              <div style={{ marginTop: '14px', marginBottom: '12px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: 0,
                    border: '1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(235,242,255,0.86)',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  Sponsored by {post.sponsored_by}
                </span>
              </div>
            ) : null}

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                marginBottom: '10px',
                fontWeight: 300,
                letterSpacing: '1px',
                fontFamily: '"Playfair Display", serif',
                color: 'var(--lux-accent)',
              }}
            >
              {post.title}
            </h1>

            <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '18px' }}>
              {post.author_name ? `By ${post.author_name}` : ''}
              {post.location_tag ? ` · ${post.location_tag}` : ''}
              {typeof post.views === 'number' ? ` · ${post.views.toLocaleString()} views` : ''}
            </div>

            {String(post.content_enhanced || '').trim() ? (
              <div style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => setShowEnhanced((s) => !s)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 0,
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'transparent',
                    color: 'rgba(235,242,255,0.86)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {showEnhanced ? 'View Original' : 'View BM Enhanced'}
                </button>
              </div>
            ) : null}

            <div style={{ ...panelStyle, padding: '18px' }}>
              <div style={{ color: 'rgba(235,242,255,0.86)', whiteSpace: 'pre-wrap', lineHeight: 1.85, fontSize: '15px' }}>{content}</div>
            </div>

            {post.affiliate_link ? (
              <div style={{ marginTop: '16px' }}>
                <a
                  href={post.affiliate_link}
                  onClick={onAffiliateClick}
                  style={{
                    color: 'var(--lux-accent)',
                    textDecoration: 'none',
                    fontWeight: 800,
                  }}
                >
                  Learn More (Affiliate Link) →
                </a>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}
