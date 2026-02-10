'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, User, Clock, Sparkles, ChevronRight, Filter, X } from 'lucide-react';
import BlogNavigation from '@/components/BlogNavigation';

// Premium LUX Theme
const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  foreground80: 'oklch(0.95 0.01 85 / 0.80)',
  foreground60: 'oklch(0.95 0.01 85 / 0.60)',
  foreground40: 'oklch(0.95 0.01 85 / 0.40)',
  foreground10: 'oklch(0.95 0.01 85 / 0.10)',
  card: 'oklch(0.10 0.005 280)',
  accent: 'oklch(0.78 0.08 65)',
};

// Series formats per pillar for the world-class blog system
const PILLAR_SERIES = {
  IMPACT: [
    { id: 'before-after', label: 'Success Stories', description: 'Real transformations and outcomes' },
    { id: 'playbook', label: 'Guides', description: 'Step-by-step frameworks' },
    { id: 'case-study', label: 'Case Studies', description: 'Detailed analysis' },
  ],
  GUEST: [
    { id: 'voices-ecosystem', label: 'Expert Opinions', description: 'Verified expert perspectives' },
    { id: 'fireside', label: 'Interviews', description: 'In-depth conversations' },
    { id: 'masterclass', label: 'Masterclass', description: 'Educational deep-dives' },
  ],
  DEV: [
    { id: 'open-kitchen', label: 'Behind the Scenes', description: 'How we build' },
    { id: 'techstack', label: 'Engineering', description: 'Architecture decisions' },
    { id: 'experiment', label: 'Experiments', description: 'What we tried & learned' },
  ],
  EDITORIAL: [
    { id: 'market-pulse', label: 'Insights', description: 'Trends and takeaways' },
    { id: 'deep-dive', label: 'Deep Dives', description: 'Comprehensive research' },
    { id: 'quick-take', label: 'Quick Reads', description: 'Rapid insights' },
  ],
};

// Audience tags for filtering
const AUDIENCE_TAGS = [
  { id: 'high-income', label: 'High Income' },
  { id: 'salaried', label: 'Salaried' },
  { id: 'nri', label: 'NRI' },
  { id: 'senior', label: 'Seniors' },
  { id: 'first-time', label: 'First Timers' },
];

// Topic tags for filtering  
const TOPIC_TAGS = [
  { id: 'tax', label: 'Tax Strategy' },
  { id: 'sip', label: 'SIP/MF' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'retirement', label: 'Retirement' },
  { id: 'real-estate', label: 'Real Estate' },
];

// Calculate reading time from content
function calculateReadingTime(content) {
  if (!content) return 4; // default
  const words = String(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)); // 200 wpm for technical content
}

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
        title: 'Developer Insight',
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

export default function PillarIndexClient({ pillar, initialPosts = null }) {
  const PILLAR = String(pillar || 'EDITORIAL').toUpperCase();
  const copy = useMemo(() => pillarCopy(PILLAR), [PILLAR]);
  const seriesOptions = PILLAR_SERIES[PILLAR] || PILLAR_SERIES.EDITORIAL;

  const [posts, setPosts] = useState(() => (Array.isArray(initialPosts) ? initialPosts : []));
  const [isLoading, setIsLoading] = useState(() => !Array.isArray(initialPosts));
  const [error, setError] = useState('');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const siteOrigin = useMemo(() => {
    try {
      return typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://bmwealth.co.in';
    } catch {
      return 'https://bmwealth.co.in';
    }
  }, []);

  const fromPath = useMemo(() => {
    switch (PILLAR) {
      case 'IMPACT':
        return '/blog/impact';
      case 'GUEST':
        return '/blog/guest';
      case 'DEV':
        return '/blog/dev';
      default:
        return null;
    }
  }, [PILLAR]);

  const getPostHref = (post) => {
    let base = null;
    if (post?.slug) base = `/blog/${post.slug}`;
    else if (post?._id) base = `/blog/community/${post._id}`;
    else base = '/blog';

    if (!fromPath) return base;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}from=${encodeURIComponent(fromPath)}`;
  };

  const getWhatsAppHref = (postHref, title) => {
    const url = `${siteOrigin}${postHref}`;
    const msg = `Hi BM Wealth, I just read: ${title || 'your blog'}\n${url}\n\nI want help with:`;
    return `https://wa.me/918850977259?text=${encodeURIComponent(msg)}`;
  };
  const [note, setNote] = useState('');

  // Featured post (most recent with most content)
  const featuredPost = useMemo(() => {
    if (posts.length === 0) return null;
    // Sort by date descending, then by content length
    const sorted = [...posts].sort((a, b) => {
      const dateA = new Date(a.approved_at || a.created_at || 0).getTime();
      const dateB = new Date(b.approved_at || b.created_at || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return (b.content_original?.length || 0) - (a.content_original?.length || 0);
    });
    return sorted[0];
  }, [posts]);

  // Filtered posts (excluding featured)
  const filteredPosts = useMemo(() => {
    let result = posts.filter(p => !featuredPost || p._id !== featuredPost._id);

    if (selectedSeries) {
      result = result.filter((p) => String(p?.series || '') === String(selectedSeries));
    }

    if (selectedTags.length > 0) {
      result = result.filter((p) => {
        const tags = Array.isArray(p?.tags) ? p.tags : [];
        return selectedTags.some((t) => tags.includes(t));
      });
    }

    return result;
  }, [posts, featuredPost, selectedSeries, selectedTags]);

  const displayPosts = useMemo(() => {
    // Avoid pillars looking “empty” when there is only one post.
    // If filters are active, respect them.
    const filtersActive = Boolean(selectedSeries) || (selectedTags && selectedTags.length > 0);
    if (filtersActive) return filteredPosts;
    if (filteredPosts.length > 0) return filteredPosts;
    return featuredPost ? [featuredPost] : [];
  }, [featuredPost, filteredPosts, selectedSeries, selectedTags]);

  const availableSeriesOptions = useMemo(() => {
    const present = new Set(
      posts
        .map((p) => String(p?.series || '').trim())
        .filter(Boolean)
    );
    return seriesOptions.filter((o) => present.has(o.id));
  }, [posts, seriesOptions]);

  const hasTagMetadata = useMemo(() => {
    return posts.some((p) => Array.isArray(p?.tags) && p.tags.length > 0);
  }, [posts]);

  const showSubTabs = useMemo(() => {
    // Keep it simple while content is low or metadata is missing.
    if (isLoading) return false;
    const hasSeries = availableSeriesOptions.length >= 2;
    const enoughPosts = posts.length >= 6;
    return hasTagMetadata || (hasSeries && enoughPosts);
  }, [availableSeriesOptions.length, hasTagMetadata, isLoading, posts.length]);

  const showSeriesPills = useMemo(() => {
    return availableSeriesOptions.length >= 2 && posts.length >= 6;
  }, [availableSeriesOptions.length, posts.length]);

  const showTagFilters = hasTagMetadata;

  useEffect(() => {
    if (!showSubTabs) {
      if (selectedSeries !== null) setSelectedSeries(null);
      if (selectedTags.length > 0) setSelectedTags([]);
      if (showFilters) setShowFilters(false);
    }
  }, [showSubTabs]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // If we already rendered local posts on the server, avoid blocking UI with a full-screen skeleton.
      if (!Array.isArray(initialPosts)) setIsLoading(true);
      setError('');
      setNote('');
      try {
        const url = `/api/posts?pillar=${encodeURIComponent(PILLAR)}&status=APPROVED`;
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

      {/* Series Selector & Filters */}
      {showSubTabs ? (
        <section className="section-container" style={{ paddingTop: '0', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            {/* Series selector pills (only when metadata + enough content) */}
            {showSeriesPills ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
                <button
                  onClick={() => setSelectedSeries(null)}
                  style={{
                    padding: '8px 16px',
                    background: selectedSeries === null ? 'var(--lux-accent)' : 'transparent',
                    color: selectedSeries === null ? LUX.background : 'var(--lux-foreground-60)',
                    border: `1px solid ${selectedSeries === null ? 'var(--lux-accent)' : 'var(--lux-foreground-10)'}`,
                    borderRadius: 0,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  All Posts
                </button>
                {availableSeriesOptions.map((series) => (
                  <button
                    key={series.id}
                    onClick={() => setSelectedSeries(selectedSeries === series.id ? null : series.id)}
                    title={series.description}
                    style={{
                      padding: '8px 16px',
                      background: selectedSeries === series.id ? 'var(--lux-accent)' : 'transparent',
                      color: selectedSeries === series.id ? LUX.background : 'var(--lux-foreground-60)',
                      border: `1px solid ${selectedSeries === series.id ? 'var(--lux-accent)' : 'var(--lux-foreground-10)'}`,
                      borderRadius: 0,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {series.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            {/* Filter toggle (only when tags exist) */}
            {showTagFilters ? (
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: showFilters ? 'var(--lux-accent)' : 'transparent',
                  color: showFilters ? LUX.background : 'var(--lux-foreground-60)',
                  border: `1px solid ${showFilters ? 'var(--lux-accent)' : 'var(--lux-foreground-10)'}`,
                  borderRadius: 0,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Filter size={14} />
                Filters
                {selectedTags.length > 0 && (
                  <span
                    style={{
                      background: 'var(--lux-background)',
                      color: 'var(--lux-accent)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  >
                    {selectedTags.length}
                  </span>
                )}
              </button>
            ) : null}
          </div>

          {/* Expandable filter section */}
          {showTagFilters && showFilters ? (
            <div
              style={{
                background: 'var(--lux-card)',
                padding: '16px',
                border: '1px solid var(--lux-foreground-10)',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--lux-foreground-40)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Audience
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {AUDIENCE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag.id) ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                          );
                        }}
                        style={{
                          padding: '6px 12px',
                          background: selectedTags.includes(tag.id) ? 'var(--lux-accent)' : 'transparent',
                          color: selectedTags.includes(tag.id) ? LUX.background : 'var(--lux-foreground-60)',
                          border: `1px solid ${selectedTags.includes(tag.id) ? 'var(--lux-accent)' : 'var(--lux-foreground-10)'}`,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--lux-foreground-40)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Topic
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {TOPIC_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            prev.includes(tag.id) ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                          );
                        }}
                        style={{
                          padding: '6px 12px',
                          background: selectedTags.includes(tag.id) ? 'var(--lux-accent)' : 'transparent',
                          color: selectedTags.includes(tag.id) ? LUX.background : 'var(--lux-foreground-60)',
                          border: `1px solid ${selectedTags.includes(tag.id) ? 'var(--lux-accent)' : 'var(--lux-foreground-10)'}`,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {selectedTags.length > 0 ? (
                <button
                  onClick={() => setSelectedTags([])}
                  style={{
                    marginTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--lux-foreground-40)',
                    fontSize: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} /> Clear filters
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Featured Post Section */}
      {!isLoading && featuredPost && posts.length > 1 && (
        <section className="section-container" style={{ paddingTop: '0', paddingBottom: '30px' }}>
          <div
            role="link"
            tabIndex={0}
            onClick={() => router.push(getPostHref(featuredPost))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(getPostHref(featuredPost));
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '0',
              background: 'var(--lux-card)',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 24%, transparent)',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            {/* Featured image */}
            <div
              style={{
                minHeight: '280px',
                backgroundImage: `url(${featuredPost.image_url || featuredPost.image || copy.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Featured content */}
            <div style={{ padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: 'var(--lux-accent)' }} />
                <span style={{ color: 'var(--lux-accent)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Featured
                </span>
              </div>
              
              <h2
                style={{
                  fontSize: 'clamp(22px, 3vw, 32px)',
                  color: 'var(--lux-accent)',
                  marginBottom: '16px',
                  lineHeight: 1.2,
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                {featuredPost.title}
              </h2>
              
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--lux-foreground-60)',
                  lineHeight: 1.7,
                  marginBottom: '20px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {String(featuredPost.content_original || '').slice(0, 300)}...
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--lux-foreground-40)', fontSize: '13px' }}>
                  <Clock size={14} />
                  {calculateReadingTime(featuredPost.content_original)} min read
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--lux-foreground-40)', fontSize: '13px' }}>
                  <Calendar size={14} />
                  {formatDate(featuredPost.approved_at || featuredPost.created_at)}
                </span>
                {featuredPost.author_name && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--lux-foreground-40)', fontSize: '13px' }}>
                    <User size={14} />
                    {featuredPost.author_name}
                  </span>
                )}
              </div>
              
              <div style={{ marginTop: '24px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--lux-accent)',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Read Full Story <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-container blog-posts-section">
        {isLoading ? (
          <div
            style={{
              minHeight: '55vh',
              background: LUX.background,
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
                    background: LUX.card,
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
        ) : displayPosts.length === 0 && posts.length === 0 ? (
          <div className="section-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(235,242,255,0.86)' }}>No posts yet.</p>
            {note ? (
              <p style={{ color: 'var(--lux-foreground-40)', marginTop: '8px' }}>{note}</p>
            ) : null}
            <p style={{ color: 'var(--lux-foreground-40)', marginTop: '8px' }}>
              Want to contribute?{' '}
              <Link href="/submit" style={{ color: 'var(--lux-accent)', textDecoration: 'none' }}>
                Submit here
              </Link>
              .
            </p>
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="section-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(235,242,255,0.86)' }}>No posts match your filters.</p>
            {selectedSeries || selectedTags.length > 0 ? (
              <button
                onClick={() => {
                  setSelectedSeries(null);
                  setSelectedTags([]);
                }}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  background: 'var(--lux-accent)',
                  color: LUX.background,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              background: LUX.background,
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
              {displayPosts.map((post, idx) => {
                const postHref = getPostHref(post);
                const next = displayPosts.length > 1 ? displayPosts[(idx + 1) % displayPosts.length] : null;
                const nextHref = next ? getPostHref(next) : null;
                const nextTitle = next?.title || '';
                const waHref = getWhatsAppHref(postHref, post?.title);
                const cardImage = post?.image_url || post?.image || copy.image;

                return (
                  <div
                    key={post._id || post.slug || idx}
                    className="blog-card-premium"
                    role="link"
                    tabIndex={0}
                    aria-label={post?.title ? `Open blog: ${post.title}` : 'Open blog'}
                    onClick={() => {
                      if (postHref && postHref !== '/blog') router.push(postHref);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (postHref && postHref !== '/blog') router.push(postHref);
                      }
                    }}
                    style={{
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: '100%',
                    }}
                  >
                    {/* Card image */}
                    <div
                      aria-hidden="true"
                      style={{
                        height: '190px',
                        backgroundImage: `url(${cardImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderBottom: '1px solid color-mix(in oklab, var(--lux-accent) 16%, transparent)',
                      }}
                    />
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
                            color: 'var(--lux-foreground-40)',
                            fontSize: '13px',
                          }}
                        >
                          <Calendar size={14} />
                          {formatDate(post.approved_at || post.created_at || new Date().toISOString())}
                        </span>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--lux-foreground-40)',
                            fontSize: '13px',
                          }}
                        >
                          <Clock size={14} />
                          {calculateReadingTime(post.content_original)} min
                        </span>
                        {post.author_name && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'var(--lux-foreground-40)',
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
                          color: 'var(--lux-foreground-60)',
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

                      {post.sponsored_by ? (
                        <div style={{ marginTop: '10px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)',
                              borderRadius: 0,
                              fontSize: '11px',
                              color: 'rgba(235,242,255,0.86)',
                            }}
                          >
                            Sponsored
                          </span>
                        </div>
                      ) : null}

                      {post.affiliate_link ? (
                        <div style={{ marginTop: '10px', color: 'var(--lux-accent)', fontSize: '12px', fontWeight: 700 }}>Affiliate link available</div>
                      ) : null}

                      {typeof post.views === 'number' ? (
                        <div style={{ marginTop: '8px', color: 'var(--lux-foreground-40)', fontSize: '12px' }}>{post.views.toLocaleString()} views</div>
                      ) : null}

                      {post.location_tag ? (
                        <div style={{ marginTop: '14px', color: 'color-mix(in oklab, var(--lux-accent) 70%, var(--lux-foreground-60))', fontSize: '13px' }}>
                          📍 {post.location_tag}
                        </div>
                      ) : null}
                    </div>

                    {/* Intentionally no “Next Read” overlay on listing cards. */}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
