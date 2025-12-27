"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import { staticBlogPost, staticBlogData } from '@/data/staticBlogData';

export default function Blog() {
  const posts = staticBlogData && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];

  return (
    <div>
      <section style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)' }}>
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h1 className="golden-gradient" style={{ fontSize: 'clamp(28px, 4vw, 56px)', marginBottom: '24px' }}>Financial Insights</h1>
          <p style={{ fontSize: '18px', color: '#C0A062', maxWidth: '700px', margin: '0 auto' }}>
            Expert knowledge and investment wisdom for your financial journey
          </p>
        </div>
      </section>

      <section className="section-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {posts.map((post, i) => (
            <Link key={i} href={`/blog/${post.slug || 'post'}`} style={{ textDecoration: 'none' }}>
              <div className="blog-card-premium">
                <LazyImage src={post.image_url || post.image} alt={post.title} style={{ width: '100%', height: '200px' }} />
                <div style={{ padding: '24px' }}>
                  <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '20px', fontSize: '12px', color: '#DAA520', marginBottom: '12px' }}>
                    {post.category}
                  </span>
                  <h3 style={{ fontSize: '20px', color: '#DAA520', marginBottom: '12px', lineHeight: 1.3 }}>{post.title}</h3>
                  <p style={{ fontSize: '14px', color: '#CCCCCC', lineHeight: 1.6, marginBottom: '16px' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C0A062', fontSize: '14px' }}>
                    <span>Read More</span><ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}



