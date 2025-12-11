import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { staticBlogPost, staticBlogData } from '../data/staticBlogData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Comparison Bar Chart Component
const ComparisonChart = () => {
  return (
    <section 
      aria-labelledby="comparison-chart-title"
      className="my-12"
      style={{
        background: '#0d0d0d',
        borderRadius: '16px',
        padding: '32px 24px',
        border: '1px solid rgba(218, 165, 32, 0.2)',
      }}
    >
      <h3 
        id="comparison-chart-title"
        style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#DAA520',
          marginBottom: '32px',
          textAlign: 'center',
        }}
      >
        Actual vs Ideal Portfolio Outcome (7-Year Period)
      </h3>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '60px', marginBottom: '24px', minHeight: '200px' }}>
        {/* Actual Portfolio Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '80px',
              height: '120px',
              background: '#6b6b6b',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>₹X</span>
          </div>
          <span style={{ color: '#999', fontSize: '16px', fontWeight: '500' }}>Actual</span>
        </div>
        
        {/* Ideal Portfolio Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '80px',
              height: '200px',
              background: '#DAA520',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#000', fontSize: '14px', fontWeight: '600' }}>₹X+47L</span>
          </div>
          <span style={{ color: '#DAA520', fontSize: '16px', fontWeight: '500' }}>Ideal</span>
        </div>
      </div>
      
      <p style={{ fontSize: '14px', color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
        Illustrative comparison based on historical benchmarks — not a forecast.
      </p>
    </section>
  );
};

// Gold Highlight Box Component
const GoldHighlightBox = () => {
  return (
    <section 
      aria-labelledby="opportunity-cost"
      className="my-12"
      style={{
        background: '#DAA520',
        borderRadius: '16px',
        padding: '48px 24px',
        boxShadow: '0 20px 50px rgba(218, 165, 32, 0.3)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2 
        id="opportunity-cost"
        style={{
          fontSize: 'clamp(40px, 8vw, 56px)',
          fontWeight: '800',
          color: '#000',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}
      >
        ₹47,00,000
      </h2>
      <p style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: '#1a1a1a', fontWeight: '600', lineHeight: 1.5 }}>
        Not ₹47,000. Not ₹4.7 lakh. Nearly half a crore rupees in potential wealth—gone.
      </p>
    </section>
  );
};

// Mid-Blog CTA Component
const MidBlogCTA = () => {
  return (
    <section 
      className="my-12"
      style={{
        background: '#0d0d0d',
        borderRadius: '16px',
        padding: '40px 32px',
        border: '2px solid #DAA520',
      }}
    >
      <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#DAA520', marginBottom: '24px' }}>
        Free 12-Point Portfolio Check (Educational Only)
      </h3>
      
      <ul style={{ marginBottom: '28px', paddingLeft: '0', listStyle: 'none' }}>
        <li style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, color: '#DAA520' }}>✓</span>
          Check goal alignment
        </li>
        <li style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, color: '#DAA520' }}>✓</span>
          Identify hidden costs
        </li>
        <li style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '12px', paddingLeft: '24px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, color: '#DAA520' }}>✓</span>
          Review risk suitability
        </li>
        <li style={{ fontSize: '16px', color: '#E5E5E5', marginBottom: '0', paddingLeft: '24px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 0, color: '#DAA520' }}>✓</span>
          Understand insurance vs investment separation
        </li>
      </ul>
      
      <a
        href="https://wa.me/918850977259"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Request Educational Review on WhatsApp"
        style={{
          display: 'inline-block',
          background: '#DAA520',
          color: '#000',
          padding: '14px 32px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(218, 165, 32, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Request Educational Review
      </a>
    </section>
  );
};

// Related Posts Component
const RelatedPosts = ({ currentSlug }) => {
  // Filter out current post and get up to 3 related posts
  const relatedPosts = staticBlogData.filter(post => post.slug !== currentSlug).slice(0, 3);
  
  if (relatedPosts.length === 0) return null;
  
  return (
    <section className="my-20">
      <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#DAA520', marginBottom: '32px' }}>
        Related Posts
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {relatedPosts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            style={{
              background: '#111',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid transparent',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#DAA520';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {post.image_url && (
              <div 
                style={{
                  height: '160px',
                  width: '100%',
                  backgroundImage: `url(${post.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#DAA520', marginBottom: '8px', lineHeight: 1.4 }}>
                {post.title}
              </h3>
              {post.date && (
                <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
                  {post.date} • {post.read_time || post.readTime}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogPost = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if this is the static blog post first
      if (slug === staticBlogPost.slug) {
        setPost(staticBlogPost);
        setError(null);
        setIsLoading(false);
        return;
      }
      
      // Otherwise, try to fetch from backend
      const response = await axios.get(`${API}/blog/slug/${slug}`);
      setPost(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Blog post not found');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogPost();
  }, [fetchBlogPost]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#C0A062' }}>Loading blog post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '18px', color: '#C0A062' }}>{error || 'Blog post not found'}</p>
        <button
          onClick={() => navigate('/blog')}
          className="btn-primary"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  // Get current URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <Helmet>
        <title>{post.title} | BM Wealth Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.tags ? post.tags.join(', ') : ''} />
        <link rel="canonical" href={`https://bmwealth.in/blog/${post.slug}`} />
        
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://bmwealth.in/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image_url || 'https://bmwealth.in/logo.webp'} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://bmwealth.in/blog/${post.slug}`} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image_url || 'https://bmwealth.in/logo.webp'} />
        
        <meta property="article:published_time" content={post.published_date} />
        <meta property="article:author" content={post.author} />
        {post.tags && post.tags.map((tag, index) => (
          <meta property="article:tag" content={tag} key={index} />
        ))}
      </Helmet>

      {/* Back Button */}
      <div className="section-container" style={{ paddingTop: '120px', paddingBottom: '20px' }}>
        <button
          onClick={() => navigate('/blog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#C0A062',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#DAA520')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#C0A062')}
          aria-label="Back to Blog"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </button>
      </div>

      {/* Hero Image Section - Requirement #3 */}
      {post.image_url && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 40px', padding: '0 20px' }}>
          <img
            src={post.image_url}
            alt="Finance dashboard with charts — BM Wealth case study"
            className="w-full h-60 md:h-72 object-cover rounded-xl"
            style={{
              width: '100%',
              height: '288px',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
            // TODO: update with licensed hero
          />
        </section>
      )}

      {/* Blog Content */}
      <article className="section-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Blog Header */}
        <header style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: '#DAA520',
              marginBottom: '24px',
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </h1>

          {/* Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              paddingBottom: '24px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                color: '#C0A062',
              }}
            >
              <User size={18} />
              {post.author}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                color: '#999',
              }}
            >
              <Calendar size={18} />
              {formatDate(post.published_date)}
            </span>
            {post.read_time && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  color: '#999',
                }}
              >
                <Clock size={18} />
                {post.read_time}
              </span>
            )}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                color: '#C0A062',
              }}
            >
              <Tag size={18} />
              {post.category}
            </span>
          </div>

          {/* "Before You Read" Box - Requirement #4 */}
          <section 
            role="note"
            style={{
              borderRadius: '12px',
              border: '2px solid #DAA520',
              background: '#0d0d0d',
              padding: '20px 24px',
              marginTop: '24px',
              marginBottom: '24px',
            }}
          >
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
              This is a real case study, anonymised for privacy.
            </p>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
              Shared strictly for educational awareness.
            </p>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0' }}>
              No products or investments are being recommended.
            </p>
          </section>

          {/* Share Buttons - Requirement #5 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '32px',
            }}
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#25D366',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0A66C2',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </header>

        {/* Main Content - Enhanced typography - Requirement #7 */}
        <div
          style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: '#E5E5E5',
            maxWidth: '100%',
          }}
          className="blog-content-wrapper"
        >
          {/* Content will be parsed and enhanced */}
          {renderEnhancedContent(post.content, post.slug)}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid rgba(218, 165, 32, 0.2)' }}>
            <h3 style={{ color: '#C0A062', fontSize: '18px', marginBottom: '16px' }}>Tags</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: 'rgba(218, 165, 32, 0.1)',
                    color: '#DAA520',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Closure - Requirement #11 */}
        <div style={{ textAlign: 'center', color: '#DAA520', fontStyle: 'italic', fontSize: 'clamp(18px, 3vw, 22px)', margin: '60px 0' }}>
          <p style={{ marginBottom: '8px' }}>Don't wait 7 years to discover hidden losses.</p>
          <p>One correct decision today can change decades.</p>
        </div>

        {/* Disclaimer - Requirement #12 */}
        <section 
          style={{
            background: '#0f0f0f',
            borderLeft: '4px solid #DAA520',
            padding: '32px 40px',
            marginTop: '60px',
            marginBottom: '60px',
          }}
        >
          <h3 style={{ color: '#DAA520', fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
            Important Disclosures (Please Read)
          </h3>
          <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#CCCCCC' }}>
            <p style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#C0A062' }}>Educational Content:</strong> This article is for educational and informational purposes only. It should not be considered personalized investment advice. The case study mentioned is based on a real situation but has been anonymized—names, specific amounts, and certain details have been modified to protect client privacy.
            </p>
            
            <p style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#C0A062' }}>Investment Risks:</strong> All investments in mutual funds, insurance products, and other financial instruments are subject to market risks. Past performance is not indicative of future results. Returns mentioned are illustrative and based on historical market data—they are not guaranteed or assured. Actual returns may vary significantly.
            </p>
            
            <p style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#C0A062' }}>Regulatory Status:</strong> BM Wealth (IRDAI License 277925 | AMFI ARN 90008) is registered to provide insurance advisory services and mutual fund distribution. We are NOT SEBI registered investment advisors (RIA) and do not provide portfolio management services, stock recommendations, or personalized investment advice requiring SEBI RIA registration.
            </p>
            
            <p style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#C0A062' }}>Due Diligence:</strong> Please read all scheme-related documents carefully before investing. Understand the risk-return profile of investment products. Consult with a qualified financial advisor to assess suitability based on your specific financial situation, goals, and risk tolerance before making any investment decisions.
            </p>
            
            <p style={{ marginBottom: '0' }}>
              <strong style={{ color: '#C0A062' }}>No Guarantees:</strong> No financial outcome can be guaranteed. The opportunity cost calculations presented are illustrative comparisons based on historical market data and standard portfolio construction principles. Individual results may differ based on specific circumstances, timing, product selection, and market conditions.
            </p>
          </div>
        </section>

        {/* Related Posts - Requirement #13 */}
        <RelatedPosts currentSlug={post.slug} />

        {/* Back to Blog Button */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/blog')}
            className="btn-primary"
          >
            Back to All Posts
          </button>
        </div>
      </article>
    </div>
  );
};

// Helper function to render enhanced content with special components
function renderEnhancedContent(htmlContent, slug) {
  // Only add special components for the 47 lakh blog post
  if (slug !== '47-lakh-investment-mistake-mumbai') {
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />;
  }

  // Split content by h2 headings to identify sections
  const sanitized = DOMPurify.sanitize(htmlContent);
  
  // Find key sections using text markers
  const sections = [];
  let remainingContent = sanitized;
  
  // Section 1: Opening content (before "The Number That Changed Everything")
  const numberChangedIndex = remainingContent.indexOf('The Number That Changed Everything');
  if (numberChangedIndex > -1) {
    const beforeNumber = remainingContent.substring(0, numberChangedIndex);
    sections.push(
      <div key="section-opening" dangerouslySetInnerHTML={{ __html: beforeNumber }} />
    );
    remainingContent = remainingContent.substring(numberChangedIndex);
  }
  
  // Section 2: "The Number That Changed Everything" - add chart before, replace gold box
  const howDoesIndex = remainingContent.indexOf('How Does This Even Happen?');
  if (howDoesIndex > -1) {
    let numberSection = remainingContent.substring(0, howDoesIndex);
    
    // Remove the existing gold box div from the content
    numberSection = numberSection.replace(
      /<div style="background: linear-gradient[^>]*>[\s\S]*?₹47,00,000[\s\S]*?<\/div>/,
      '<!-- GOLD_BOX_PLACEHOLDER -->'
    );
    
    // Insert chart and then content
    sections.push(
      <div key="section-number-intro" dangerouslySetInnerHTML={{ 
        __html: numberSection.substring(0, numberSection.indexOf('<!-- GOLD_BOX_PLACEHOLDER -->')) 
      }} />
    );
    
    // Add comparison chart
    sections.push(<ComparisonChart key="chart" />);
    
    // Add gold highlight box
    sections.push(<GoldHighlightBox key="highlight" />);
    
    // Add remaining content of this section after the gold box
    const afterBox = numberSection.substring(numberSection.indexOf('<!-- GOLD_BOX_PLACEHOLDER -->') + '<!-- GOLD_BOX_PLACEHOLDER -->'.length);
    if (afterBox.trim()) {
      sections.push(
        <div key="section-number-after" dangerouslySetInnerHTML={{ __html: afterBox }} />
      );
    }
    
    remainingContent = remainingContent.substring(howDoesIndex);
  }
  
  // Section 3: "How Does This Even Happen?" - add CTA after this section
  const partHurtsIndex = remainingContent.indexOf('The Part That Hurts Most');
  if (partHurtsIndex > -1) {
    const howDoesSection = remainingContent.substring(0, partHurtsIndex);
    sections.push(
      <div key="section-how-does" dangerouslySetInnerHTML={{ __html: howDoesSection }} />
    );
    
    // Add mid-blog CTA
    sections.push(<MidBlogCTA key="mid-cta" />);
    
    remainingContent = remainingContent.substring(partHurtsIndex);
  }
  
  // Add all remaining content
  if (remainingContent.trim()) {
    sections.push(
      <div key="section-remaining" dangerouslySetInnerHTML={{ __html: remainingContent }} />
    );
  }

  return <div style={{ maxWidth: '100%', margin: '0 auto', lineHeight: '1.8' }}>{sections}</div>;
}

export default BlogDetail;
