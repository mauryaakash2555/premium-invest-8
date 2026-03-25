'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import Comments from '@/components/blog/Comments';
import SocialShare from '@/components/blog/SocialShare';
import ViewTracker from '@/components/blog/ViewTracker';
import PostBottomCTA from '@/components/blog/PostBottomCTA';
import BlogNavigation from '@/components/BlogNavigation';
import ReactMarkdown from 'react-markdown';
import { normalizeCommunityMarkdown } from '@/lib/blog/formatting';

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

  const router = useRouter();
  const searchParams = useSearchParams();

  const backHref = useMemo(() => {
    const raw = searchParams?.get('from');
    if (!raw) return '/blog';
    if (raw === '/blog/impact' || raw === '/blog/guest' || raw === '/blog/dev' || raw === '/blog' || raw === '/blog/editorial') {
      return raw;
    }
    return '/blog';
  }, [searchParams]);

  const backLabel = useMemo(() => {
    switch (backHref) {
      case '/blog/impact':
        return '← Back to Community Impact';
      case '/blog/guest':
        return '← Back to Guest Columns';
      case '/blog/dev':
        return '← Back to Developer Insight';
      default:
        return '← Back to Blog';
    }
  }, [backHref]);

  const onBackClick = (e) => {
    e?.preventDefault?.();
    try {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {}
    router.push(backHref);
  };

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

  const content = useMemo(() => {
    if (!post) return '';
    const hasEnhanced = Boolean(String(post.content_enhanced || '').trim());
    if (!hasEnhanced) return String(post.content_original || '');
    return showEnhanced ? String(post.content_enhanced || '') : String(post.content_original || '');
  }, [post, showEnhanced]);

  const markdown = useMemo(() => normalizeCommunityMarkdown(content), [content]);

  const onAffiliateClick = async (e) => {
    if (!post?.affiliate_link) return;
    e.preventDefault();
    try {
      await fetch(`/api/track-affiliate-click/${encodeURIComponent(safeId)}`, { method: 'POST' });
    } catch {}
    window.open(post.affiliate_link, '_blank', 'noopener,noreferrer');
  };

  const shareDescription = useMemo(() => {
    const raw = String(content || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    return raw.length > 220 ? `${raw.slice(0, 220)}…` : raw;
  }, [content]);

  const canonicalPostId = useMemo(() => {
    if (post?.id) return String(post.id);
    return safeId;
  }, [post, safeId]);


  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'oklch(0.06 0.005 280)',
      '--lux-background': 'oklch(0.06 0.005 280)',
      '--lux-foreground': 'oklch(0.95 0.01 85)',
      '--lux-foreground-80': 'oklch(0.95 0.01 85 / 0.80)',
      '--lux-foreground-60': 'oklch(0.95 0.01 85 / 0.60)',
      '--lux-foreground-40': 'oklch(0.95 0.01 85 / 0.40)',
      '--lux-foreground-10': 'oklch(0.95 0.01 85 / 0.10)',
      '--lux-foreground-05': 'oklch(0.95 0.01 85 / 0.05)',
      '--lux-card': 'oklch(0.10 0.005 280)',
      '--lux-accent': 'oklch(0.78 0.08 65)',
    }}>
      <section className="section-container" style={{ paddingTop: '120px', paddingBottom: '60px', maxWidth: '980px' }}>
        <Link href={backHref} onClick={onBackClick} style={{ color: 'rgba(235,242,255,0.86)', textDecoration: 'none' }}>
          {backLabel}
        </Link>

        <div style={{ marginTop: '18px' }}>
          <BlogNavigation />
        </div>

        {isLoading ? <div style={{ ...panelStyle, padding: '14px', marginTop: '14px', color: 'rgba(235,242,255,0.86)' }}>Loading…</div> : null}
        {error ? <div style={{ ...panelStyle, padding: '14px', marginTop: '14px', color: 'rgba(235,242,255,0.86)' }}>{error}</div> : null}

        {post ? (
          <>
            {/* Editorial disclaimer for community submissions */}
            <div style={{
              padding: '12px 16px',
              marginTop: '14px',
              marginBottom: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.03)',
              fontSize: '13px',
              color: 'rgba(235,242,255,0.72)',
              lineHeight: 1.6,
            }}>
              This is a community submission. Views expressed are those of the community member and do not constitute financial advice.
            </div>

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

            <div style={{ marginBottom: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: 0,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
                  color: 'rgba(235,242,255,0.86)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                {post.pillar === 'DEV' ? 'Developer Insight' : post.pillar === 'GUEST' ? 'Guest Post' : 'Community'}
              </span>
            </div>

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

            {post.content ? (
              <div style={{ color: 'var(--lux-foreground-60)', fontSize: '14px', marginBottom: '10px' }}>
                {Math.max(1, Math.ceil((post.content.length || 0) / 1200))} min read
              </div>
            ) : null}

            <div style={{ color: 'var(--lux-foreground-40)', fontSize: '13px', marginBottom: '18px' }}>
              {post.author_name ? `By ${post.author_name}` : ''}
              {post.location_tag ? ` · ${post.location_tag}` : ''}
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

            <div style={{ ...panelStyle, padding: '22px' }}>
              <div style={{ color: 'rgba(235,242,255,0.86)', lineHeight: 1.95, fontSize: '16px' }}>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '28px 0 12px', color: 'rgba(235,242,255,0.92)' }}>
                        {children}
                      </h2>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '28px 0 12px', color: 'rgba(235,242,255,0.92)' }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '22px 0 10px', color: 'rgba(235,242,255,0.92)' }}>
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p style={{ margin: '0 0 16px', lineHeight: 1.85, color: 'rgba(235,242,255,0.86)' }}>{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ margin: '0 0 16px 20px', padding: 0, lineHeight: 1.85 }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ margin: '0 0 16px 20px', padding: 0, lineHeight: 1.85 }}>{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ margin: '0 0 8px' }}>{children}</li>
                    ),
                    strong: ({ children }) => (
                      <span style={{ fontWeight: 800, color: 'rgba(235,242,255,0.92)' }}>{children}</span>
                    ),
                    a: ({ href, children }) => {
                      const safeHref = typeof href === 'string' ? href : '#';
                      const isExternal = /^https?:\/\//i.test(safeHref);
                      return (
                        <a
                          href={safeHref}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          style={{ color: 'var(--lux-accent)', textDecoration: 'none', fontWeight: 800 }}
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Author Block */}
            <div
              style={{
                ...panelStyle,
                padding: '18px',
                marginTop: '16px',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background:
                      'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 40%, transparent) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(0,0,0,0.88)',
                    fontWeight: 800,
                  }}
                >
                  {(String(post.author_name || 'C')[0] || 'C').toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'rgba(235,242,255,0.92)', fontSize: '14px', fontWeight: 900 }}>
                    {post.author_name || 'Community Contributor'}
                  </div>
                  <div style={{ color: 'var(--lux-foreground-60)', fontSize: '13px' }}>Community Contributor</div>
                </div>
              </div>
              <div style={{ marginTop: '10px', color: 'var(--lux-foreground-60)', fontSize: '14px', lineHeight: 1.7 }}>
                Shared via the BM Wealth community.
              </div>
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

            {/* View Tracker - tracks view after 10 seconds */}
            <ViewTracker postId={canonicalPostId} slug={post?.slug || safeId} />

            {/* Social Share Buttons */}
            <SocialShare
              url={typeof window !== 'undefined' ? window.location.href : `https://www.bmwealth.co.in/blog/community/${safeId}`}
              title={post.title}
              description={shareDescription}
            />

            {/* Post Bottom CTA - Newsletter + Submit Story */}
            <PostBottomCTA title="Enjoyed this story?" />

            {/* Comments Section */}
            <Comments postId={canonicalPostId} postSlug={post?.slug || safeId} postTitle={post.title} />
          </>
        ) : null}
      </section>
    </div>
  );
}
