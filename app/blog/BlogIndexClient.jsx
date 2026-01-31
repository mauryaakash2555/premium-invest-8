/**
 * FILE: app\blog\page.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - lucide-react
 * - next/link
 * - @/components/user/LazyImage
 * - @/components/user/MobileScrollBoost
 * - @/data/staticBlogData
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import LazyImage from '@/components/user/LazyImage';
import MobileScrollBoost from '@/components/user/MobileScrollBoost';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';
import FAQSection from '@/components/shared/FAQSection';
import BlogNavigation from '@/components/BlogNavigation';

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogPosts();
  }, []);
  const fetchBlogPosts = async () => {
    try {
      // Ensure staticBlogData is an array and has content
      const staticBlogs = Array.isArray(staticBlogData) && staticBlogData.length > 0 
        ? staticBlogData 
        : [staticBlogPost];
      
      // Show all static blogs immediately
      setBlogPosts(staticBlogs);
      setIsLoading(false);
      
      // Then try to fetch backend blogs in background (skip on localhost to avoid CORS noise)
      const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
      const isLocalhost =
        typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      const canFetchBackend = !isLocalhost && (window.location.hostname === 'bmwealth.co.in' || window.location.hostname === 'www.bmwealth.co.in');

      if (canFetchBackend) {
        try {
          const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bmwealth-backend.onrender.com';
          const response = await fetch(`${BACKEND_URL}/api/blog`, { cache: 'no-store' });
          if (response.ok) {
            const backendPosts = (await response.json()) || [];
            const staticSlugs = staticBlogs.map((blog) => blog.slug).filter(Boolean);
            const uniqueBackendPosts = backendPosts.filter((post) => post.slug && !staticSlugs.includes(post.slug));
            setBlogPosts([...staticBlogs, ...uniqueBackendPosts]);
          }
        } catch (backendError) {
          if (debug) console.warn('Backend blog fetch failed (using static only):', backendError);
        }
      } else {}
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setBlogPosts([staticBlogPost]);
      setIsLoading(false);
    }
  };
  const allPosts = blogPosts.length > 0 ? blogPosts : [staticBlogPost];
  
  // Get unique categories
  const categories = [...new Set(allPosts.map(post => post.category).filter(Boolean))];
  
  // Filter posts by selected category
  const displayPosts = selectedCategory 
    ? allPosts.filter(post => post.category === selectedCategory)
    : allPosts;

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const faqs = [
    {
      question: 'Are these blog posts personalised financial advice?',
      answer:
        'No. The blog is educational and informational. For advice specific to your situation, consult a qualified professional.',
    },
    {
      question: 'Where can I find your calculators and tools?',
      answer:
        'You can access BM Wealth Intelligence Tools from the Tools page. It includes the Tax Optimization Intelligence calculator and more.',
    },
    {
      question: 'Do you use affiliate links in posts?',
      answer:
        'Some pages may contain affiliate links. If you sign up through them, BM Wealth may earn a commission at no extra cost to you.',
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div>
      <script
        id="blog-index-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Mobile optimization for blog card images */}
      <style>{`
        @media (max-width: 768px) {
          .blog-card-image-wrapper img {
            object-fit: contain !important;
            background: #000000 !important;
          }
          .blog-card-image-wrapper {
            background: #000000 !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section
        className="page-hero-responsive"
        style={{
          minHeight: '65vh',
          maxHeight: '65vh',
          height: '65vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&fm=webp&q=60)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            filter: 'brightness(1.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        <div className="section-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              marginBottom: '24px',
              fontWeight: 300,
              letterSpacing: '3px',
              opacity: 0.95,
              textShadow: '0 3px 12px rgba(0,0,0,0.4)',
              fontFamily: '"Playfair Display", serif',
              color: 'var(--lux-accent)',
            }}
          >
            Financial Insights
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'color-mix(in oklab, var(--lux-accent) 70%, rgba(235,242,255,0.92))',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Elite insights, market analysis, and updates from BM Wealth Talks
          </p>
        </div>
      </section>

      {/* Internal links */}
      <section className="section-container" style={{ paddingTop: '26px', paddingBottom: '10px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <Link
            href="/live-intelligence"
            style={{
              padding: '10px 16px',
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
              color: 'rgba(235, 242, 255, 0.92)',
              textDecoration: 'none',
              fontSize: '14px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            Explore Live Intelligence
          </Link>
          <Link
            href="/tools"
            style={{
              padding: '10px 16px',
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
              color: 'rgba(235, 242, 255, 0.92)',
              textDecoration: 'none',
              fontSize: '14px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            Browse Tools
          </Link>
        </div>
      </section>

      {/* Pillar Navigation (links; no layout changes to grid) */}
      <section className="section-container" style={{ paddingTop: '10px', paddingBottom: '0px' }}>
        <BlogNavigation />
      </section>

      {/* Category Filter */}
      {categories.length > 1 && (
        <section className="section-container" style={{ paddingTop: '40px', paddingBottom: '20px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
          }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 20px',
                borderRadius: 0,
                border: '1px solid rgba(255,255,255,0.14)',
                background:
                  selectedCategory === null
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                    : 'transparent',
                color: selectedCategory === null ? 'rgba(245,245,245,0.92)' : '#888',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                backdropFilter: selectedCategory === null ? 'blur(10px)' : undefined,
                WebkitBackdropFilter: selectedCategory === null ? 'blur(10px)' : undefined,
              }}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 0,
                  border: '1px solid rgba(255,255,255,0.14)',
                  background:
                    selectedCategory === category
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                      : 'transparent',
                  color: selectedCategory === category ? 'rgba(245,245,245,0.92)' : '#888',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  backdropFilter: selectedCategory === category ? 'blur(10px)' : undefined,
                  WebkitBackdropFilter: selectedCategory === category ? 'blur(10px)' : undefined,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Blog Posts */}
      <section className="section-container blog-posts-section">
        {isLoading ? (
          <div style={{
            minHeight: '70vh',
            background: '#000000',
            padding: 'clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px)',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Loading Skeleton */}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              .skeleton-shimmer {
                background: linear-gradient(90deg, #000000 25%, #0a0a0a 50%, #000000 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
              }
            `}</style>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '40px'
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  background: '#000000',
                  borderRadius: 0,
                  padding: '20px',
                  border: '1px solid color-mix(in oklab, var(--lux-accent) 24%, transparent)',
                  overflow: 'hidden'
                }}>
                  <div className="skeleton-shimmer" style={{ height: '200px', borderRadius: 0, marginBottom: '20px' }} />
                  <div className="skeleton-shimmer" style={{ height: '20px', width: '120px', borderRadius: 0, marginBottom: '16px' }} />
                  <div className="skeleton-shimmer" style={{ height: '28px', width: '90%', borderRadius: 0, marginBottom: '12px' }} />
                  <div className="skeleton-shimmer" style={{ height: '16px', width: '100%', borderRadius: 0, marginBottom: '8px' }} />
                  <div className="skeleton-shimmer" style={{ height: '16px', width: '80%', borderRadius: 0 }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '40px',
            }}
          >
            {displayPosts.map((post) => (
              <Link
                href={`/blog/${post.slug || post.id}`}
                key={post.id || post.slug}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <MobileScrollBoost
                  holdMs={6000}
                  bandTop={0.25}
                  bandBottom={0.85}
                  className="blog-card-premium"
                  style={{
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  {(post.image_url || post.image) ? (
                    <LazyImage
                      src={post.image_url || post.image}
                      alt={post.image_alt || post.title}
                      className="blog-card-image-wrapper"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '200px',
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                      }}
                    />
                  )}
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
                        {formatDate(post.published_date || post.date)}
                      </span>
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
                        {post.author}
                      </span>
                    </div>
                    
                    {post.category && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          background: 'rgba(0,0,0,0.70)',
                          border: '1px solid rgba(170,198,255,0.18)',
                          borderRadius: 0,
                          fontSize: '12px',
                          color: 'rgba(235,242,255,0.86)',
                          marginBottom: '12px',
                        }}
                      >
                        {post.category}
                      </span>
                    )}
                    
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
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt || post.summary}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        color: 'var(--lux-accent)',
                        fontSize: '14px',
                        fontWeight: 500,
                      }}>
                        Read More →
                      </span>
                      {(post.readTime || post.read_time) && (
                        <span style={{
                          color: '#666',
                          fontSize: '12px',
                        }}>
                          {post.readTime || post.read_time}
                        </span>
                      )}
                    </div>
                  </div>
                </MobileScrollBoost>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section-container" style={{ paddingTop: '10px', paddingBottom: '60px' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#d0d0d0', marginBottom: '0', textAlign: 'center' }}>
          Explore: <Link href="/tools" style={{ color: 'var(--lux-accent)', textDecoration: 'underline' }}>Tools</Link> ·{' '}
          <Link href="/tools/tax-optimization" style={{ color: 'var(--lux-accent)', textDecoration: 'underline' }}>Tax Intelligence</Link> ·{' '}
          <Link href="/services" style={{ color: 'var(--lux-accent)', textDecoration: 'underline' }}>Services</Link>
        </p>
      </section>

      <FAQSection faqs={faqs} />
    </div>
  );
}










