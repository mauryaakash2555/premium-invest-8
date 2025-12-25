"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { staticBlogPost, allBlogPosts } from '@/data/staticBlogData';

export default function BlogDetail() {
  const params = useParams();
  const slug = params?.slug;
  
  // Find the blog post by slug or use the static one
  const posts = allBlogPosts || [staticBlogPost];
  const post = posts.find(p => p.slug === slug) || staticBlogPost;

  if (!post) {
    return (
      <div className="section-container" style={{ textAlign: 'center', paddingTop: '150px' }}>
        <h1 style={{ color: '#DAA520' }}>Post Not Found</h1>
        <Link href="/blog" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <section style={{ paddingTop: '120px', paddingBottom: '40px', background: '#000' }}>
        <div className="section-container" style={{ maxWidth: '900px' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#C0A062', marginBottom: '30px', textDecoration: 'none' }}>
            <ArrowLeft size={20} /> Back to Blog
          </Link>
          
          <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '20px', fontSize: '14px', color: '#DAA520', marginBottom: '20px' }}>
            {post.category}
          </span>
          
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#DAA520', marginBottom: '20px', lineHeight: 1.3 }}>
            {post.title}
          </h1>
          
          <p style={{ fontSize: '18px', color: '#C0A062', marginBottom: '30px' }}>
            {post.date} • {post.read_time || '5 min read'}
          </p>
        </div>
      </section>

      <section className="section-container" style={{ maxWidth: '900px', paddingTop: '20px' }}>
        {post.image_url && (
          <img 
            src={post.image_url} 
            alt={post.title} 
            style={{ width: '100%', height: 'auto', borderRadius: '16px', marginBottom: '40px' }} 
          />
        )}
        
        <div 
          style={{ fontSize: '18px', color: '#CCCCCC', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }}
        />

        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid rgba(218, 165, 32, 0.2)', textAlign: 'center' }}>
          <h3 style={{ color: '#DAA520', marginBottom: '20px' }}>Need Financial Guidance?</h3>
          <a href="https://wa.me/918850977259" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Chat with Our Experts
          </a>
        </div>
      </section>
    </div>
  );
}



