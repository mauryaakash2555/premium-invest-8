import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { staticBlogPost, staticBlogData } from '../data/staticBlogData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogPost = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check if this is any static blog post first (check all static blogs)
      const staticBlogs = Array.isArray(staticBlogData) && staticBlogData.length > 0 
        ? staticBlogData 
        : [staticBlogPost]; // Fallback to blog 1 if array is empty
      
      const foundStaticBlog = staticBlogs.find(blog => blog.slug === slug);
      if (foundStaticBlog) {
        setPost(foundStaticBlog);
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

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <Helmet>
        <title>{post.title} | BM Wealth Blog</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.tags ? post.tags.join(', ') : ''} />
        <link rel="canonical" href={`https://www.bmwealth.co.in/blog/${post.slug}`} />
        
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.bmwealth.co.in/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:image" content={post.image_url || 'https://www.bmwealth.co.in/logo.webp'} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://www.bmwealth.co.in/blog/${post.slug}`} />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        <meta name="twitter:image" content={post.image_url || 'https://www.bmwealth.co.in/logo.webp'} />
        
        <meta property="article:published_time" content={post.published_date} />
        <meta property="article:author" content={post.author} />
        {post.tags && post.tags.map((tag, index) => (
          <meta property="article:tag" content={tag} key={index} />
        ))}
      </Helmet>

      {/* Mobile-specific image optimization styles for ALL blogs */}
      <style>{`
        /* Mobile: Show full image without cropping - applies to ALL blog images */
        @media (max-width: 768px) {
          .blog-hero-image {
            object-fit: contain !important;
            object-position: center !important;
            background: #000000;
          }
          .blog-hero-section {
            height: 350px !important;
          }
        }
        
        /* Tablet adjustments */
        @media (min-width: 769px) and (max-width: 1024px) {
          .blog-hero-image {
            object-fit: cover !important;
            object-position: center 30% !important;
          }
        }
      `}</style>

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
        >
          <ArrowLeft size={20} />
          Back to Blog
        </button>
      </div>

      {/* Hero Section with Featured Image */}
      {post.image_url && (
        <section className="blog-hero-section" style={{ position: 'relative', overflow: 'hidden', marginBottom: '40px', height: '400px' }}>
          <img
            className="blog-hero-image"
            src={post.image_url}
            alt={post.image_alt || post.title}
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.3,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            loading="lazy"
            decoding="async"
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,1) 100%)',
            }}
          />
        </section>
      )}

      {/* Blog Content */}
      <article className="section-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Blog Header */}
        <header style={{ marginBottom: '40px' }}>
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              paddingBottom: '24px',
              borderBottom: '1px solid rgba(218, 165, 32, 0.2)',
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

          {/* Social Share Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '24px',
              paddingTop: '20px',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                color: '#C0A062',
                fontWeight: '500',
              }}
            >
              Share:
            </span>
            
            {/* WhatsApp Share */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(37, 211, 102, 0.1)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                borderRadius: '8px',
                color: '#25D366',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(37, 211, 102, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>

            {/* LinkedIn Share */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(10, 102, 194, 0.1)',
                border: '1px solid rgba(10, 102, 194, 0.3)',
                borderRadius: '8px',
                color: '#0A66C2',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(10, 102, 194, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(10, 102, 194, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>

            {/* Twitter Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(29, 155, 240, 0.1)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                borderRadius: '8px',
                color: '#1D9BF0',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 155, 240, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </a>
          </div>
        </header>

        {/* Blog Content */}
        <div
          style={{
            fontSize: '18px',
            color: '#E5E5E5',
            lineHeight: 1.8,
          }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

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

      {/* SEBI Disclaimer */}
      <section className="section-container" style={{ marginTop: '80px' }}>
        <div className="sebi-disclaimer">
          <strong>Educational Content Disclaimer:</strong> The information provided in this blog post
          is for educational purposes only and should not be construed as financial advice.
          Please consult with a registered financial advisor before making any investment
          decisions. All investments are subject to market risks.
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
