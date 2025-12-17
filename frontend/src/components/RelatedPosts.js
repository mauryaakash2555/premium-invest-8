import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const RelatedPosts = ({ posts, currentPostSlug }) => {
  const navigate = useNavigate();

  // Filter out current post and limit to 3
  const relatedPosts = posts
    .filter(post => post.slug !== currentPostSlug)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div style={{ marginTop: '80px', marginBottom: '60px' }}>
      <h2
        style={{
          fontSize: 'clamp(28px, 4vw, 36px)',
          color: '#DAA520',
          marginBottom: '30px',
          fontFamily: "'Playfair Display', serif",
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '32px' }}>📚</span>
        Related Reading
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {relatedPosts.map((post) => (
          <div
            key={post.slug}
            onClick={() => navigate(`/blog/${post.slug}`)}
            style={{
              background: 'rgba(192, 160, 98, 0.05)',
              border: '1px solid rgba(192, 160, 98, 0.2)',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(192, 160, 98, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.4)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(192, 160, 98, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(192, 160, 98, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(218, 165, 32, 0.1)',
                color: '#DAA520',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '16px',
              }}
            >
              {post.category}
            </div>
            <h3
              style={{
                fontSize: '18px',
                color: '#DAA520',
                marginBottom: '12px',
                lineHeight: 1.4,
                fontWeight: '600',
              }}
            >
              {post.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#999',
                lineHeight: 1.6,
                marginBottom: '16px',
              }}
            >
              {post.excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid rgba(192, 160, 98, 0.1)',
              }}
            >
              {post.read_time && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: '#999',
                  }}
                >
                  <Clock size={14} />
                  {post.read_time}
                </span>
              )}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  color: '#C0A062',
                  fontWeight: '600',
                }}
              >
                Read More
                <ArrowRight size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;


