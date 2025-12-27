'use client';

import { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import LazyImage from '@/components/LazyImage';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';

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
      
      // Then try to fetch backend blogs in background
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bmwealth-backend.onrender.com';
        const response = await fetch(`${BACKEND_URL}/api/blog`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const backendPosts = await response.json() || [];
          const staticSlugs = staticBlogs.map(blog => blog.slug).filter(Boolean);
          const uniqueBackendPosts = backendPosts.filter(post => post.slug && !staticSlugs.includes(post.slug));
          const combinedPosts = [...staticBlogs, ...uniqueBackendPosts];
          setBlogPosts(combinedPosts);
        }
      } catch (backendError) {
        console.warn('Backend blog fetch failed (using static only):', backendError);
      }
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

  return (
    <div>
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
              color: '#C0A062',
            }}
          >
            Financial Insights
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#C0A062',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Elite insights, market analysis, and updates from BM Wealth Talks
          </p>
        </div>
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
                borderRadius: '20px',
                border: '1px solid rgba(218, 165, 32, 0.3)',
                background: selectedCategory === null ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
                color: selectedCategory === null ? '#DAA520' : '#888',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease',
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
                  borderRadius: '20px',
                  border: '1px solid rgba(218, 165, 32, 0.3)',
                  background: selectedCategory === category ? 'rgba(218, 165, 32, 0.2)' : 'transparent',
                  color: selectedCategory === category ? '#DAA520' : '#888',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
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
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(218, 165, 32, 0.2)',
                  overflow: 'hidden'
                }}>
                  <div className="skeleton-shimmer" style={{ height: '240px', borderRadius: '12px', marginBottom: '20px' }} />
                  <div className="skeleton-shimmer" style={{ height: '20px', width: '120px', borderRadius: '6px', marginBottom: '16px' }} />
                  <div className="skeleton-shimmer" style={{ height: '28px', width: '90%', borderRadius: '6px', marginBottom: '12px' }} />
                  <div className="skeleton-shimmer" style={{ height: '16px', width: '100%', borderRadius: '6px', marginBottom: '8px' }} />
                  <div className="skeleton-shimmer" style={{ height: '16px', width: '80%', borderRadius: '6px' }} />
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
                <div
                  className="glass-effect"
                  style={{
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(218, 165, 32, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {(post.image_url || post.image) ? (
                    <LazyImage
                      src={post.image_url || post.image}
                      alt={post.image_alt || post.title}
                      className="blog-card-image-wrapper"
                      style={{
                        width: '100%',
                        height: '240px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '240px',
                        background: 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)',
                      }}
                    />
                  )}
                  <div style={{ padding: '24px' }}>
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
                          background: 'rgba(218, 165, 32, 0.1)',
                          borderRadius: '20px',
                          fontSize: '12px',
                          color: '#DAA520',
                          marginBottom: '12px',
                        }}
                      >
                        {post.category}
                      </span>
                    )}
                    
                    <h2
                      style={{
                        fontSize: '20px',
                        color: '#DAA520',
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
                        color: '#C0A062',
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
