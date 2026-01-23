import { useState, useEffect } from 'react';
import { Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { staticBlogPost, staticBlogData } from '../data/staticBlogData';
import LazyImage from '../components/LazyImage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Blog = () => {
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
        : [staticBlogPost]; // Fallback to blog 1 if array is empty
      
      // Show all static blogs immediately (no backend wait!)
      setBlogPosts(staticBlogs);
      setIsLoading(false);
      
      // Then try to fetch backend blogs in background (non-blocking)
      try {
        const response = await axios.get(`${API}/blog`, {
          timeout: 5000, // Reduced timeout - don't block if slow
        });
        const backendPosts = response.data || [];
        // Get all static blog slugs to avoid duplicates
        const staticSlugs = staticBlogs.map(blog => blog.slug).filter(Boolean);
        const uniqueBackendPosts = backendPosts.filter(post => post.slug && !staticSlugs.includes(post.slug));
        // Combine: static blogs first, then backend blogs
        const combinedPosts = [...staticBlogs, ...uniqueBackendPosts];
        setBlogPosts(combinedPosts);
      } catch (backendError) {
        console.warn('Backend blog fetch failed (using static only):', backendError);
        // Keep static blogs - already shown above
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      // Fallback: still show blog 1 at minimum
      setBlogPosts([staticBlogPost]);
      setIsLoading(false);
    }
  };

  // Placeholder blog posts if database is empty
  const placeholderPosts = [
    {
      id: '1',
      slug: 'understanding-mutual-funds',
      title: 'Understanding Mutual Funds: A Comprehensive Guide',
      excerpt:
        'Learn the fundamentals of mutual fund investing and how to choose the right funds for your portfolio.',
      author: 'BM Wealth Team',
      category: 'Investment Education',
      published_date: new Date().toISOString(),
      image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&h=400&fit=crop&auto=format&fm=webp&q=60',
    },
    {
      id: '2',
      slug: 'power-of-sip',
      title: 'The Power of SIP: Building Wealth Systematically',
      excerpt:
        'Discover how Systematic Investment Plans can empower you to achieve long-term financial objectives through disciplined investing.',
      author: 'BM Wealth Team',
      category: 'Investment Strategies',
      published_date: new Date().toISOString(),
      image_url: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=600&h=400&fit=crop&auto=compress&fm=webp&q=60',
    },
    {
      id: '3',
      slug: 'portfolio-diversification',
      title: 'Portfolio Diversification: Managing Risk Effectively',
      excerpt:
        'Master key strategies for diversifying your investment portfolio to minimize risk and maximize returns.',
      author: 'Brahmdeo Maurya',
      category: 'Risk Management',
      published_date: new Date().toISOString(),
      image_url: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=600&h=400&fit=crop&auto=format&fm=webp&q=60',
    },
  ];

  const allPosts = blogPosts.length > 0 ? blogPosts : placeholderPosts;
  
  // Get unique categories
  const categories = [...new Set(allPosts.map(post => post.category).filter(Boolean))];
  
  // Filter posts by selected category
  const displayPosts = selectedCategory 
    ? allPosts.filter(post => post.category === selectedCategory)
    : allPosts;

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      // If clicking the same category, deselect it (show all)
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    // Smooth scroll to blog posts section
    setTimeout(() => {
      const postsSection = document.querySelector('.blog-posts-section');
      if (postsSection) {
        postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
      <Helmet>
        <title>Financial Insights & Investment Tips | BM Wealth Blog Mumbai</title>
        <meta name="description" content="Expert investment insights, mutual fund tips, SIP strategies, and financial planning advice from BM Wealth Mumbai. Stay updated with market trends and wealth management tips." />
        <meta name="keywords" content="investment blog Mumbai, mutual fund tips, SIP strategies, financial planning advice, wealth management blog, BM Wealth insights" />
        <link rel="canonical" href="https://www.bmwealth.co.in/blog" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bmwealth.co.in/blog" />
        <meta property="og:title" content="Financial Insights & Investment Tips | BM Wealth Blog" />
        <meta property="og:description" content="Expert investment insights and financial planning advice from BM Wealth Mumbai." />
        <meta property="og:image" content="https://www.bmwealth.co.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.bmwealth.co.in/blog" />
        <meta name="twitter:title" content="Financial Insights & Investment Tips | BM Wealth Blog" />
        <meta name="twitter:description" content="Expert investment insights and financial planning advice from BM Wealth Mumbai." />
        <meta name="twitter:image" content="https://www.bmwealth.co.in/logo.webp" />
      </Helmet>

      {/* Mobile optimization for ALL blog card images */}
      <style>{`
        /* Mobile: Show full image without cropping for ALL blog cards */
        @media (max-width: 768px) {
          .blog-card-image-wrapper img,
          .blog-card-image-wrapper-img {
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
            data-testid="blog-heading"
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
              color: 'var(--lux-accent)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Elite insights, market analysis, and updates from BM Wealth Talks
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-container">
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
            
            {/* Title Skeleton */}
            <div className="skeleton-shimmer" style={{
              height: '40px',
              width: '300px',
              borderRadius: '8px',
              marginBottom: '40px',
              margin: '0 auto 40px'
            }} />
            
            {/* Blog Cards Skeleton */}
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
                  border: '1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)',
                  overflow: 'hidden'
                }}>
                  {/* Image skeleton */}
                  <div className="skeleton-shimmer" style={{
                    height: '240px',
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }} />
                  
                  {/* Category skeleton */}
                  <div className="skeleton-shimmer" style={{
                    height: '20px',
                    width: '120px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }} />
                  
                  {/* Title skeleton */}
                  <div className="skeleton-shimmer" style={{
                    height: '28px',
                    width: '90%',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }} />
                  
                  {/* Text skeleton */}
                  <div className="skeleton-shimmer" style={{
                    height: '16px',
                    width: '100%',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }} />
                  <div className="skeleton-shimmer" style={{
                    height: '16px',
                    width: '80%',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }} />
                  
                  {/* Footer skeleton */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <div className="skeleton-shimmer" style={{
                      height: '16px',
                      width: '100px',
                      borderRadius: '6px'
                    }} />
                    <div className="skeleton-shimmer" style={{
                      height: '16px',
                      width: '80px',
                      borderRadius: '6px'
                    }} />
                  </div>
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
                to={`/blog/${post.slug || post.id}`}
                key={post.id}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="glass-effect"
                  data-testid={`blog-post-${post.id}`}
                  style={{
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px color-mix(in oklab, var(--lux-accent) 30%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {post.image_url ? (
                    <LazyImage
                      src={post.image_url}
                      alt={post.title}
                      className="blog-card-image-wrapper"
                      style={{
                        width: '100%',
                        height: '240px',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '240px',
                        background: 'linear-gradient(135deg, var(--lux-accent) 0%, var(--lux-accent) 100%)',
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
                          fontSize: '14px',
                          color: 'var(--lux-accent)',
                        }}
                      >
                        <Tag size={14} />
                        {post.category}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          color: '#888',
                        }}
                      >
                        <Calendar size={14} />
                        {formatDate(post.published_date)}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '22px',
                        color: 'var(--lux-accent)',
                        marginBottom: '12px',
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '16px',
                        color: '#CCCCCC',
                        lineHeight: 1.6,
                        marginBottom: '16px',
                      }}
                    >
                      {post.excerpt}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '16px',
                        borderTop: '1px solid color-mix(in oklab, var(--lux-accent) 20%, transparent)',
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          color: 'var(--lux-accent)',
                        }}
                      >
                        <User size={16} />
                        {post.author}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          color: 'var(--lux-accent)',
                          cursor: 'pointer',
                        }}
                      >
                        Read More <ExternalLink size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Podcast Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          padding: '80px 20px',
        }}
      >
        <div className="section-container">
          <div
            className="glass-effect"
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              background: 'color-mix(in oklab, var(--lux-accent) 5%, transparent)',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 40px)',
                marginBottom: '20px',
                color: 'var(--lux-accent)',
              }}
            >
              BM Wealth Talks Podcast
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: '#CCCCCC',
                marginBottom: '30px',
                maxWidth: '700px',
                margin: '0 auto 30px',
                lineHeight: 1.6,
              }}
            >
              Listen to distinguished insights, market analysis, and financial expertise from our team of
              experienced advisors. Available on Spotify and all major podcast platforms.
            </p>
            <a
              href="https://open.spotify.com/show/bmwealth"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="podcast-spotify-link"
            >
              Listen on Spotify
            </a>
          </div>
        </div>
      </section>

      {/* SEBI Disclaimer */}
      <section className="section-container">
        <div className="sebi-disclaimer">
          <strong>Educational Content Disclaimer:</strong> The information provided in our blog
          is for educational purposes only and should not be construed as financial advice.
          Please consult with a registered financial advisor before making any investment
          decisions. All investments are subject to market risks.
        </div>
      </section>
    </div>
  );
};

export default Blog;