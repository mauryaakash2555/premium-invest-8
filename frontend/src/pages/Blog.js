import { useState, useEffect } from 'react';
import { Calendar, User, Tag, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      setBlogPosts(response.data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder blog posts if database is empty
  const placeholderPosts = [
    {
      id: '1',
      title: 'Understanding Mutual Funds: A Comprehensive Guide',
      excerpt:
        'Learn the fundamentals of mutual fund investing and how to choose the right funds for your portfolio.',
      author: 'BM Wealth Team',
      category: 'Investment Education',
      published_date: new Date().toISOString(),
      image_url: 'https://images.unsplash.com/photo-1618044733300-9472054094ee?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
    },
    {
      id: '2',
      title: 'The Power of SIP: Building Wealth Systematically',
      excerpt:
        'Discover how Systematic Investment Plans can help you achieve long-term financial goals through disciplined investing.',
      author: 'BM Wealth Team',
      category: 'Investment Strategies',
      published_date: new Date().toISOString(),
      image_url: 'https://images.pexels.com/photos/7948058/pexels-photo-7948058.jpeg?w=600&h=400&fit=crop&auto=compress&fm=webp&q=75',
    },
    {
      id: '3',
      title: 'Portfolio Diversification: Managing Risk Effectively',
      excerpt:
        'Learn key strategies for diversifying your investment portfolio to minimize risk and maximize returns.',
      author: 'Brahmdeo Maurya',
      category: 'Risk Management',
      published_date: new Date().toISOString(),
      image_url: 'https://images.unsplash.com/photo-1745270917331-787c80129680?w=600&h=400&fit=crop&auto=format&fm=webp&q=75',
    },
  ];

  const displayPosts = blogPosts.length > 0 ? blogPosts : placeholderPosts;

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
        <link rel="canonical" href="https://bmwealth.in/blog" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bmwealth.in/blog" />
        <meta property="og:title" content="Financial Insights & Investment Tips | BM Wealth Blog" />
        <meta property="og:description" content="Expert investment insights and financial planning advice from BM Wealth Mumbai." />
        <meta property="og:image" content="https://bmwealth.in/logo.webp" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://bmwealth.in/blog" />
        <meta name="twitter:title" content="Financial Insights & Investment Tips | BM Wealth Blog" />
        <meta name="twitter:description" content="Expert investment insights and financial planning advice from BM Wealth Mumbai." />
        <meta name="twitter:image" content="https://bmwealth.in/logo.webp" />
      </Helmet>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
          paddingTop: '100px',
        }}
      >
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h1
            data-testid="blog-heading"
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              marginBottom: '24px',
            }}
            className="golden-gradient"
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
            Expert advice, market insights, and updates from BM Wealth Talks
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '18px', color: '#C0A062' }}>Loading blog posts...</p>
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
              <div
                key={post.id}
                className="glass-effect"
                data-testid={`blog-post-${post.id}`}
                style={{
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
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
                <div
                  className="image-overlay"
                  style={{
                    width: '100%',
                    height: '240px',
                    background: post.image_url
                      ? `url(${post.image_url})`
                      : 'linear-gradient(135deg, #DAA520 0%, #C0A062 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
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
                        color: '#C0A062',
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
                      color: '#DAA520',
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
                      borderTop: '1px solid rgba(218, 165, 32, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#C0A062',
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
                        color: '#DAA520',
                        cursor: 'pointer',
                      }}
                    >
                      Read More <ExternalLink size={14} />
                    </span>
                  </div>
                </div>
              </div>
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
              background: 'rgba(218, 165, 32, 0.05)',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 40px)',
                marginBottom: '20px',
                color: '#DAA520',
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
              Listen to expert insights, market analysis, and financial advice from our team of
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