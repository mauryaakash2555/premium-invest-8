'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';

export default function BlogDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Handle Next.js 15 params (Promise)
    Promise.resolve(params).then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    
    // Find the post from staticBlogData
    const allBlogs = Array.isArray(staticBlogData) && staticBlogData.length > 0
      ? staticBlogData
      : [staticBlogPost];
    
    const foundPost = allBlogs.find(p => p.slug === slug);
    setPost(foundPost || null);
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#B8860B', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '16px' }}>404</h1>
        <p style={{ color: '#999', fontSize: '18px', marginBottom: '32px' }}>Blog post not found</p>
        <Link href="/blog" style={{
          color: '#B8860B',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ArrowLeft size={20} />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero Image */}
      {post.imageUrl && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px'
        }}>
          <img
            src={post.imageUrl}
            alt={post.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '500px',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
        </div>
      )}

      {/* Article Content */}
      <article style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px 80px 20px'
      }}>
        {/* Back Link */}
        <Link href="/blog" style={{
          color: '#B8860B',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Category Tag */}
        {post.category && (
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(184, 134, 11, 0.2)',
            color: '#B8860B',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '16px'
          }}>
            {post.category}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: '600',
          color: '#fff',
          lineHeight: '1.2',
          marginBottom: '24px'
        }}>
          {post.title}
        </h1>

        {/* Meta Info */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#999',
            fontSize: '14px'
          }}>
            <Calendar size={16} />
            {post.publishDate || post.published || 'December 2025'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#999',
            fontSize: '14px'
          }}>
            <User size={16} />
            {post.author || 'BM Wealth Editorial Team'}
          </div>
          {post.readTime && (
            <div style={{ color: '#999', fontSize: '14px' }}>
              {post.readTime}
            </div>
          )}
        </div>

        {/* Summary/Excerpt */}
        {post.excerpt && (
          <p style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: '#ccc',
            fontStyle: 'italic',
            marginBottom: '40px',
            paddingLeft: '20px',
            borderLeft: '3px solid #B8860B'
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div 
          style={{ color: '#e5e5e5', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ 
            __html: typeof post.content === 'string' 
              ? post.content 
              : (Array.isArray(post.content) ? post.content.join('') : 'No content available.')
          }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {post.tags.map((tag, index) => (
                <span key={index} style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#999',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link href="/blog" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#B8860B',
            color: '#0a0a0a',
            padding: '14px 32px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.3s ease'
          }}>
            <ArrowLeft size={18} />
            Back to All Articles
          </Link>
        </div>
      </article>

      {/* Embedded responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          article {
            padding: 0 16px 60px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
