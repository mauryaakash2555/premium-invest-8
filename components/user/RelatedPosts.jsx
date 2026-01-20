/**
 * FILE: components\user\RelatedPosts.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - next/navigation
 * - lucide-react
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

import { useRouter } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';

const RelatedPosts = ({ posts, currentPostSlug }) => {
  const router = useRouter();

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
          color: 'var(--lux-accent)',
          marginBottom: '30px',
          fontFamily: "'Cormorant Garamond', serif",
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
            onClick={() => router.push(`/blog/${post.slug}`)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              borderRadius: '0px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--lux-accent) 22%, rgba(255, 255, 255, 0.10))';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
                color: 'var(--lux-accent)',
                padding: '6px 12px',
                borderRadius: '0px',
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
                color: 'rgba(255, 255, 255, 0.92)',
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
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
                  color: 'var(--lux-accent)',
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

