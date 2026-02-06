'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import BlogNavigation from '@/components/BlogNavigation';
import { 
  FeaturedCard, 
  PostCard, 
  TagFilter, 
  SeriesSelector,
  AuthorityBadges 
} from '@/components/blog/EnhancedBlogComponents';
import { 
  PILLAR_CONFIG, 
  enhancePost, 
  getPostsByPillar, 
  getFeaturedPosts 
} from '@/lib/blog/schema';

/**
 * Enhanced Pillar Index Page
 * 
 * Features:
 * - Featured posts hero section
 * - Series selector (iconic repeatable formats)
 * - Tag-based filtering
 * - Reading time and authority badges
 * - Responsive grid layout
 */
export default function EnhancedPillarIndex({ pillar, posts = [] }) {
  const PILLAR = String(pillar || 'EDITORIAL').toUpperCase();
  const config = PILLAR_CONFIG[PILLAR] || PILLAR_CONFIG.EDITORIAL;
  
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get featured posts for this pillar
  const featuredPosts = useMemo(() => {
    return posts
      .filter(p => p.pillar === PILLAR && p.featured)
      .map(enhancePost)
      .filter(Boolean)
      .slice(0, 3);
  }, [posts, PILLAR]);

  // Get filtered posts
  const filteredPosts = useMemo(() => {
    let result = posts
      .filter(p => p.pillar === PILLAR)
      .map(enhancePost)
      .filter(Boolean);

    // Filter by series
    if (selectedSeries) {
      result = result.filter(p => p.series === selectedSeries);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(p => 
        selectedTags.some(tag => (p.tags || []).includes(tag))
      );
    }

    // Sort by date
    return result.sort((a, b) => 
      new Date(b.published).getTime() - new Date(a.published).getTime()
    );
  }, [posts, PILLAR, selectedSeries, selectedTags]);

  // Non-featured posts for main list
  const listPosts = useMemo(() => {
    const featuredSlugs = new Set(featuredPosts.map(p => p.slug));
    return filteredPosts.filter(p => !featuredSlugs.has(p.slug));
  }, [filteredPosts, featuredPosts]);

  return (
    <div className="min-h-screen bg-[color:var(--lux-background)]">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: '45vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '100px',
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${config.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&h=900&fit=crop'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.5,
            filter: 'brightness(0.8)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl mx-auto">
          <div className="text-4xl mb-4">{config.icon}</div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: config.color }}
          >
            {config.title}
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--lux-foreground-80)] mb-2 font-medium">
            {config.tagline}
          </p>
          <p className="text-sm md:text-base text-[color:var(--lux-foreground-60)] max-w-2xl mx-auto">
            {config.description}
          </p>

          {/* Format Description */}
          {config.format && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/50 backdrop-blur text-sm text-[color:var(--lux-foreground-60)]">
              <Sparkles className="w-4 h-4 text-[color:var(--lux-accent)]" />
              <span>{config.format.readingTime} reads</span>
              <span className="text-[color:var(--lux-foreground-10)]">•</span>
              <span>Includes: {config.format.includes?.join(', ')}</span>
            </div>
          )}
        </div>
      </section>

      {/* Navigation */}
      <section className="px-6 md:px-12 lg:px-24 py-6 border-b border-[color:var(--lux-foreground-05)]">
        <BlogNavigation />
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && !selectedSeries && selectedTags.length === 0 && (
        <section className="px-6 md:px-12 lg:px-24 py-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[color:var(--lux-accent)] text-lg">★</span>
            <h2 className="text-xl font-semibold text-[color:var(--lux-foreground)]">
              Featured Stories
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, i) => (
              <FeaturedCard key={post.slug} post={post} priority={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Series + Filters */}
      <section className="px-6 md:px-12 lg:px-24 py-6 border-y border-[color:var(--lux-foreground-05)] space-y-4">
        {/* Series Selector */}
        <SeriesSelector
          pillar={PILLAR}
          selectedSeries={selectedSeries}
          onSeriesChange={setSelectedSeries}
        />

        {/* Tag Filter */}
        <TagFilter
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          showCategories={['audience', 'topic']}
        />
      </section>

      {/* Posts List */}
      <section className="px-6 md:px-12 lg:px-24 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[color:var(--lux-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listPosts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[color:var(--lux-foreground)]">
                {selectedSeries 
                  ? config.series?.find(s => s.id === selectedSeries)?.name
                  : `All ${config.title}`
                }
              </h2>
              <span className="text-sm text-[color:var(--lux-foreground-40)]">
                {listPosts.length} {listPosts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>
            <div className="space-y-4">
              {listPosts.map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-[color:var(--lux-foreground-40)] mb-4">
              No posts found with these filters.
            </p>
            <button
              onClick={() => {
                setSelectedTags([]);
                setSelectedSeries(null);
              }}
              className="px-4 py-2 border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 lg:px-24 py-16 border-t border-[color:var(--lux-foreground-05)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-[color:var(--lux-foreground)] mb-4">
            Want Personalized Guidance?
          </h2>
          <p className="text-[color:var(--lux-foreground-60)] mb-6">
            Our team can help you apply these insights to your specific situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground)] hover:border-[color:var(--lux-accent)] transition-colors"
            >
              Try Our Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/918850977259?text=Hi%20BM%20Wealth%2C%20I%20was%20reading%20your%20blog%20and%20want%20to%20discuss%20my%20situation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[color:var(--lux-accent)] text-black font-medium hover:opacity-90 transition-opacity"
            >
              WhatsApp Us
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-6">
            <AuthorityBadges badges={['AMFI']} />
          </div>
        </div>
      </section>
    </div>
  );
}
