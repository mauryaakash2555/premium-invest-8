import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft, Clock } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { staticBlogPost } from '../data/staticBlogData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ShareButtons = ({ title }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="premium-share">
      <span className="premium-share__label">Share</span>

      <a
        className="premium-share__button premium-share__button--whatsapp"
        href={`https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        WhatsApp
      </a>

      <a
        className="premium-share__button premium-share__button--linkedin"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn
      </a>

      <a
        className="premium-share__button premium-share__button--twitter"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
        Twitter
      </a>
    </div>
  );
};

const BeforeYouRead = () => (
  <div className="premium-card">
    <p className="premium-card__title">Before you read</p>
    <p className="premium-card__body">
      This is an educational case study. Names and details are intentionally adjusted for privacy, but
      every lesson is real and based on actual portfolio data.
    </p>
  </div>
);

const ComparisonChart = () => (
  <div className="premium-compare">
    <div className="premium-compare__item">
      <p className="premium-compare__label">Actual 7-year outcome</p>
      <p className="premium-compare__value">Scattered products</p>
      <p className="premium-compare__hint">High costs, no goal alignment</p>
    </div>
    <div className="premium-compare__item">
      <p className="premium-compare__label">Optimal 7-year outcome</p>
      <p className="premium-compare__value">Goal-first portfolio</p>
      <p className="premium-compare__hint">Aligned to risk, costs monitored</p>
    </div>
  </div>
);

const GoldHighlight = () => (
  <div className="premium-highlight">
    <p>Nearly half a crore rupees in potential wealth—gone because the portfolio never had a plan.</p>
  </div>
);

const MidBlogCTA = () => (
  <div className="premium-cta">
    <div>
      <p className="premium-cta__eyebrow">Need clarity?</p>
      <p className="premium-cta__title">Get an educational portfolio review</p>
      <p className="premium-cta__body">
        Understand costs, allocation, and whether every product you hold actually serves a goal.
      </p>
    </div>
    <div className="premium-cta__actions">
      <a href="https://wa.me/918850977259" target="_blank" rel="noopener noreferrer" className="btn-primary">
        WhatsApp an expert
      </a>
      <a href="https://bmwealth.co.in" target="_blank" rel="noopener noreferrer" className="premium-cta__link">
        Visit bmwealth.co.in
      </a>
    </div>
  </div>
);

const Divider = () => <div className="premium-divider" aria-hidden="true" />;

const RelatedPosts = () => (
  <div className="premium-related">
    <h3>Related Posts</h3>
    <ul>
      <li>
        <span>Retirement reality check: ₹2.3 crore shortfall</span>
        <a href="/blog/retirement-shortfall-case-study">Read next</a>
      </li>
      <li>
        <span>Why expense ratios decide long-term winners</span>
        <a href="/blog">Explore insights</a>
      </li>
    </ul>
  </div>
);

const PremiumBlogContent = () => (
  <div className="premium-blog-content">
    <div className="premium-kicker">
      <p>He Lost ₹47 Lakh Following</p>
      <p>"Expert" Advice</p>
      <p>Here's What He Wishes He Knew 7 Years Ago</p>
    </div>

    <div className="premium-meta-block">
      <p>By BM Wealth Editorial Team</p>
      <p>December 9, 2025 | 8-Minute Read | Investment Education</p>
    </div>

    <p>True story from Mumbai. Names and details changed for privacy.</p>

    <p>The message arrived at 11:47 PM on a Tuesday:</p>
    <p>"Sir, please... can you check my father's investments? Something feels very wrong."</p>
    <p>
      The voice on the call was shaking. A 29-year-old software engineer from Borivali, calling about his father—a
      successful chartered accountant who lives in a comfortable 2BHK in Bandra, drives a Honda City, and has been
      investing diligently for 18 years.
    </p>
    <p>The next morning, we connected on video call. He shared his screen.</p>
    <p>A folder opened. Inside were dozens of documents:</p>
    <ul className="premium-list">
      <li>→ Five mutual fund statements (all different fund houses, no clear strategy)</li>
      <li>→ Three ULIP policies with 5-year lock-in periods</li>
      <li>→ Two traditional insurance plans marketed as "investment schemes"</li>
      <li>→ Multiple "guaranteed return" endowment plans</li>
      <li>→ Several debt funds with expense ratios above 2%</li>
    </ul>
    <p>Everything scattered. Nothing aligned. No clear financial goals documented anywhere.</p>

    <Divider />

    <h2>The Number That Changed Everything</h2>
    <p>
      We spent three hours analyzing the portfolio. Running calculations. Comparing historical market data. Checking
      expense ratios. Understanding the actual product structures.
    </p>
    <p>Then came the moment that made the room go quiet.</p>
    <p>We compared:</p>
    <p>What his portfolio actually delivered over 7 years</p>
    <p>versus</p>
    <p>
      What a simple, goal-aligned, properly structured portfolio could have delivered historically in the same period
      (based on market data from similar time frames).
    </p>

    <ComparisonChart />

    <p className="premium-strong">The opportunity cost: ₹47,00,000</p>

    <GoldHighlight />

    <p>Not ₹47,000. Not ₹4.7 lakh. Nearly half a crore rupees in potential wealth—gone.</p>

    <Divider />

    <h2>How Does This Even Happen?</h2>

    <MidBlogCTA />

    <p>Here's what most people don't understand: This wasn't a case of fraud. The father wasn't scammed. He wasn't cheated.</p>
    <p>He was simply sold products that didn't match his actual financial goals.</p>
    <p>The core problems we identified:</p>

    <ol className="premium-ordered">
      <li>
        <p className="premium-strong">1. Product Selection Without Goal Mapping</p>
        <p>
          He was buying "investment products" without first defining what he was actually investing FOR. Retirement? Child's
          education? Emergency fund? Wealth creation? Each goal needs a different strategy, timeline, and risk approach. He
          had products, but no plan.
        </p>
      </li>
      <li>
        <p className="premium-strong">2. Mixing Insurance with Investment</p>
        <p>
          Three ULIPs and two traditional endowment plans. These products combine life insurance with investment—and
          historically, they do neither particularly well. High charges eat into returns. Lock-in periods trap capital. The
          insurance coverage is usually inadequate for actual family needs.
        </p>
      </li>
      <li>
        <p className="premium-strong">3. High-Cost Products Eating Returns Silently</p>
        <p>
          Some of his mutual funds had expense ratios above 2%. Over 15-20 years, these charges compound into massive wealth
          destruction. A 2% annual charge on ₹10 lakh growing at 12% for 20 years can cost you over ₹12 lakh in lost returns.
          Most investors never even check this number.
        </p>
      </li>
      <li>
        <p className="premium-strong">4. No Asset Allocation Strategy</p>
        <p>
          His portfolio had no clear equity-debt split aligned to his age, risk capacity, or financial goals. Some years he
          was 90% equity (too risky for his situation). Other years, 70% debt (too conservative for wealth building). Asset
          allocation—not product selection—determines 80-90% of portfolio returns over time.
        </p>
      </li>
      <li>
        <p className="premium-strong">5. Zero Portfolio Review for 7 Years</p>
        <p>
          Once products were sold, there was no systematic annual review. No rebalancing. No checking if funds were
          underperforming. No adjusting strategy as life situations changed. The portfolio was on autopilot—with no pilot
          actually monitoring the flight.
        </p>
      </li>
    </ol>

    <p>When we finished explaining these issues, the son was silent for a full minute.</p>
    <p>"My father trusted someone completely. He did everything they told him to do. And this is the result."</p>
    <p>This is the painful reality for millions of Indian families. Sincerity without proper financial guidance can be extremely expensive.</p>

    <Divider />

    <h2>The Part That Hurts Most</h2>
    <p>This wasn't a careless investor. This was a CA—someone who understands numbers, analyzes balance sheets for clients, and makes careful financial decisions professionally.</p>
    <p>He worked 10-12 hour days. Saved diligently. Invested regularly. Did everything right from a discipline perspective.</p>
    <p>The only thing he didn't do? Ask the right questions about product suitability, cost structure, and goal alignment before committing his hard-earned money.</p>
    <p>If someone this financially aware can lose ₹47 lakh in opportunity cost, imagine what's happening to families without this background.</p>

    <Divider />

    <h2>What Every Investor Must Understand</h2>
    <p>After reviewing 200+ portfolios over the past decade, certain patterns emerge clearly. Here's what separates successful wealth builders from those who struggle:</p>

    <ul className="premium-list">
      <li>→ Goals First, Products Second</li>
      <li>→ Keep Insurance and Investment Separate</li>
      <li>→ Understand All Costs</li>
      <li>→ Build Proper Asset Allocation</li>
      <li>→ Review and Rebalance Annually</li>
    </ul>

    <Divider />

    <h2>Are You in the Same Situation?</h2>
    <p>Take 5 minutes right now. Pull out your investment statements. Check:</p>
    <ul className="premium-list">
      <li>→ Can you explain WHY you own each specific investment?</li>
      <li>→ Do you have any ULIPs or traditional insurance policies someone called "investment plans"?</li>
      <li>→ Do you know the exact expense ratio of each mutual fund?</li>
      <li>→ Is there a clear asset allocation strategy aligned to your goals?</li>
      <li>→ When was the last time someone actually reviewed your portfolio comprehensively?</li>
    </ul>

    <Divider />

    <h2>What Changed for This Family</h2>
    <p>After our initial consultation, we spent time helping the family understand their actual financial situation—not with jargon, but with clear explanations of what they owned and why it might not be optimal.</p>
    <p>We provided educational guidance on:</p>
    <ul className="premium-list">
      <li>→ Different financial goals</li>
      <li>→ Asset allocation</li>
      <li>→ Product cost impact</li>
      <li>→ Insurance vs investment separation</li>
      <li>→ Importance of annual portfolio reviews</li>
    </ul>
    <p>18 months later, they have clarity and structure.</p>

    <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
    <p>Get a Free Educational Consultation</p>
    <p>(KEEP THIS SECTION EXACT)</p>
    <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
    <p>Important Disclaimers & Regulatory Information:</p>
    <p>(KEEP THIS SECTION EXACT — DO NOT CHANGE ANY WORD)</p>
    <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
    <p>Published by BM Wealth Editorial Team | December 9, 2025</p>
  </div>
);

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

  const isPremiumStory = post.slug === staticBlogPost.slug;
  const displayTitle = isPremiumStory ? 'He Lost ₹47 Lakh Trusting a So-Called ‘Expert’ — What Every Investor Must Learn' : post.title;
  const listingTitle = isPremiumStory ? 'Mumbai Father Lost ₹47 Lakh — The Costly Mistake No One Talks About' : post.title;
  const metaDescription = isPremiumStory ? 'True story from Mumbai. Names and details changed for privacy.' : post.excerpt;
  const displayAuthor = isPremiumStory ? 'BM Wealth Editorial Team' : post.author;
  const displayReadTime = isPremiumStory ? '8-Minute Read' : post.read_time;
  const displayCategory = isPremiumStory ? 'Investment Education' : post.category;

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <Helmet>
        <title>{listingTitle} | BM Wealth Blog</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={post.tags ? post.tags.join(', ') : ''} />
        <link rel="canonical" href={`https://bmwealth.in/blog/${post.slug}`} />
        
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://bmwealth.in/blog/${post.slug}`} />
        <meta property="og:title" content={listingTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={post.image_url || 'https://bmwealth.in/logo.webp'} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://bmwealth.in/blog/${post.slug}`} />
        <meta name="twitter:title" content={listingTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={post.image_url || 'https://bmwealth.in/logo.webp'} />
        
        <meta property="article:published_time" content={post.published_date} />
        <meta property="article:author" content={displayAuthor} />
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
            {displayTitle}
          </h1>

          <ShareButtons title={displayTitle} />

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
              {displayAuthor}
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
            {displayReadTime && (
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
                {displayReadTime}
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
              {displayCategory}
            </span>
          </div>

          {isPremiumStory && <BeforeYouRead />}
        </header>

        {/* Blog Content */}
        {isPremiumStory ? (
          <PremiumBlogContent />
        ) : (
          <div
            style={{
              fontSize: '18px',
              color: '#E5E5E5',
              lineHeight: 1.8,
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
        )}

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

        <RelatedPosts />
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
