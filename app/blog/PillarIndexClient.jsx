'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import BlogNavigation from '@/components/BlogNavigation';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function pillarCopy(pillar) {
  switch (pillar) {
    case 'IMPACT':
      return {
        title: 'Community Impact',
        subtitle: 'Stories and outcomes that improve everyday financial life.',
        image:
          'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1600&h=900&fit=crop&auto=format&fm=webp&q=70',
      };
    case 'GUEST':
      return {
        title: 'Guest Columns',
        subtitle: 'Expert perspectives from verified professionals.',
        image:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=900&fit=crop&auto=format&fm=webp&q=70',
      };
    case 'DEV':
      return {
        title: 'Dev Writes',
        subtitle: 'Product, engineering, AI, and systems thinking.',
        image:
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop&auto=format&fm=webp&q=70',
      };
    default:
      return {
        title: 'BM Editorial',
        subtitle: 'Premium wealth insights and market intelligence.',
        image:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop&auto=format&fm=webp&q=70',
      };
  }
}

export default function PillarIndexClient({ pillar }) {
  const PILLAR = String(pillar || 'EDITORIAL').toUpperCase();
  const copy = useMemo(() => pillarCopy(PILLAR), [PILLAR]);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError('');
      setNote('');
      try {
        const url = `/api/proxy-posts?pillar=${encodeURIComponent(PILLAR)}&status=APPROVED`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setPosts(Array.isArray(json) ? json : []);
      } catch (e) {
        // Prefer a graceful empty state over a hard error if upstream is temporarily down.
        if (!cancelled) {
          setPosts([]);
          setError('');
          setNote('Posts are syncing. Please check back in a minute.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [PILLAR]);

  return (
    <div>
      {/* Hero Section (matches existing blog vibe) */}
      <section
        className="page-hero-responsive"
        style={{
          minHeight: '55vh',
          maxHeight: '55vh',
          height: '55vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage: `url(${copy.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.62,
            filter: 'brightness(1.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '18px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
            }}
          >
            {copy.title}
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'color-mix(in oklab, var(--lux-accent) 70%, rgba(235,242,255,0.92))',
              maxWidth: '820px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {copy.subtitle}
          </p>
        </div>
      </section>

      <section className="section-container" style={{ paddingTop: '26px', paddingBottom: '10px' }}>
        <BlogNavigation />
      </section>

      <section className="section-container blog-posts-section">
        {isLoading ? (
          <div
            style={{
              minHeight: '55vh',
              background: '#000000',
              padding: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '40px',
              }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: '#000000',
                    borderRadius: 0,
                    padding: '20px',
                    border: '1px solid color-mix(in oklab, var(--lux-accent) 24%, transparent)',
                    overflow: 'hidden',
                    minHeight: '260px',
                  }}
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="section-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(235,242,255,0.86)' }}>{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="section-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(235,242,255,0.86)' }}>No posts yet.</p>
            {note ? (
              <p style={{ color: '#888', marginTop: '8px' }}>{note}</p>
            ) : null}
            <p style={{ color: '#888', marginTop: '8px' }}>
              Want to contribute?{' '}
              <Link href="/submit" style={{ color: 'var(--lux-accent)', textDecoration: 'none' }}>
                Submit here
              </Link>
              .
            </p>
          </div>
        ) : (
          <div
            style={{
              background: '#000000',
              padding: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '40px',
              }}
            >
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={post.slug ? `/blog/${post.slug}` : '/blog'}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="blog-card-premium"
                    style={{
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: '100%',
                    }}
                  >
                    <div style={{ padding: '20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#888',
                            fontSize: '13px',
                          }}
                        >
                          <Calendar size={14} />
                          {formatDate(post.approved_at || post.created_at || new Date().toISOString())}
                        </span>
                        {post.author_name && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: '#888',
                              fontSize: '13px',
                            }}
                          >
                            <User size={14} />
                            {post.author_name}
                          </span>
                        )}
                      </div>

                      <h2
                        style={{
                          fontSize: '20px',
                          color: 'var(--lux-accent)',
                          marginBottom: '12px',
                          lineHeight: 1.3,
                          fontFamily: '"Playfair Display", serif',
                        }}
                      >
                        {post.title}
                      </h2>

                      <p
                        style={{
                          fontSize: '14px',
                          color: '#999',
                          lineHeight: 1.6,
                          marginBottom: '0px',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {String(post.content_original || '').slice(0, 360)}
                      </p>

                      {post.location_tag ? (
                        <div style={{ marginTop: '14px', color: 'color-mix(in oklab, var(--lux-accent) 70%, #999)', fontSize: '13px' }}>
                          📍 {post.location_tag}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
