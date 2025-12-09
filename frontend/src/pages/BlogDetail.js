import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { staticBlogPost } from '../data/staticBlogData';

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

  return (
    <div style={{ background: '#0A0A1A', minHeight: '100vh' }}>
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
        >
          <ArrowLeft size={20} />
          Back to Blog
        </button>
      </div>

      {/* Hero Section with Featured Image */}
      {post.image_url && (
        <section style={{ position: 'relative', overflow: 'hidden', marginBottom: '40px' }}>
          <div
            style={{
              width: '100%',
              height: '400px',
              backgroundImage: `url(${post.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(10,10,26,0.5) 0%, rgba(10,10,26,1) 100%)',
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
