'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ChevronRight, Tag, Filter, X } from 'lucide-react';
import { PILLAR_CONFIG, TAG_CATEGORIES, AUTHORITY_BADGES, enhancePost } from '@/lib/blog/schema';

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Featured Hero Card - Large card for featured posts
 */
export function FeaturedCard({ post, priority = false }) {
  const enhanced = enhancePost(post);
  if (!enhanced) return null;

  const href = `/blog/${enhanced.slug}`;

  return (
    <Link href={href} className="group block relative">
      <article className="relative overflow-hidden border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 backdrop-blur-xl">
        {/* Image */}
        <div className="aspect-[16/9] relative overflow-hidden">
          <Image
            src={enhanced.imageUrl}
            alt={enhanced.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Pillar Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-wider uppercase"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: enhanced.pillarConfig?.color || 'var(--lux-accent)',
                border: `1px solid ${enhanced.pillarConfig?.color || 'var(--lux-accent)'}40`,
              }}
            >
              {enhanced.pillarConfig?.icon} {enhanced.pillarConfig?.title}
            </span>
          </div>

          {/* Featured Badge */}
          {enhanced.featured && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium tracking-wider uppercase bg-[color:var(--lux-accent)] text-black">
                ★ Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* TL;DR */}
          {enhanced.tldr && (
            <p className="text-[color:var(--lux-accent)] text-sm font-medium mb-3 line-clamp-2">
              TL;DR: {enhanced.tldr}
            </p>
          )}

          <h2 className="text-xl md:text-2xl font-semibold text-[color:var(--lux-foreground)] mb-3 group-hover:text-[color:var(--lux-accent)] transition-colors line-clamp-2">
            {enhanced.title}
          </h2>

          <p className="text-[color:var(--lux-foreground-60)] text-sm mb-4 line-clamp-2">
            {enhanced.summary}
          </p>

          {/* Key Numbers */}
          {enhanced.keyNumbers && enhanced.keyNumbers.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-[color:var(--lux-foreground-05)]">
              {enhanced.keyNumbers.slice(0, 3).map((num, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold text-[color:var(--lux-accent)]">{num.value}</div>
                  <div className="text-xs text-[color:var(--lux-foreground-40)]">{num.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[color:var(--lux-foreground-40)]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(enhanced.published)}
            </span>
            {enhanced.badges?.map(badge => (
              <span key={badge} className="flex items-center gap-1 text-[color:var(--lux-accent)]">
                ✓ {AUTHORITY_BADGES[badge]?.label}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * Compact Post Card - For list views
 */
export function PostCard({ post }) {
  const enhanced = enhancePost(post);
  if (!enhanced) return null;

  const href = `/blog/${enhanced.slug}`;

  return (
    <Link href={href} className="group block">
      <article className="flex gap-4 p-4 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/50 hover:bg-[color:var(--lux-card)]/80 transition-colors">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden">
          <Image
            src={enhanced.imageUrl}
            alt={enhanced.title}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Pillar + Series */}
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-xs font-medium"
              style={{ color: enhanced.pillarConfig?.color }}
            >
              {enhanced.pillarConfig?.icon} {enhanced.pillarConfig?.title}
            </span>
            {enhanced.series && (
              <>
                <span className="text-[color:var(--lux-foreground-10)]">•</span>
                <span className="text-xs text-[color:var(--lux-foreground-40)]">
                  {enhanced.pillarConfig?.series?.find(s => s.id === enhanced.series)?.name}
                </span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-[color:var(--lux-foreground)] group-hover:text-[color:var(--lux-accent)] transition-colors line-clamp-2 mb-1">
            {enhanced.title}
          </h3>

          <p className="text-sm text-[color:var(--lux-foreground-40)] line-clamp-1 mb-2">
            {enhanced.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-[color:var(--lux-foreground-40)]">
            <span>{formatDate(enhanced.published)}</span>
            {enhanced.relatedTools?.length > 0 && (
              <>
                <span>•</span>
                <span className="text-[color:var(--lux-accent)]">Has Calculator</span>
              </>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-[color:var(--lux-foreground-10)] group-hover:text-[color:var(--lux-accent)] transition-colors self-center" />
      </article>
    </Link>
  );
}

/**
 * Tag Filter Pills
 */
export function TagFilter({ selectedTags, onTagsChange, showCategories = ['audience', 'topic'] }) {
  const [expanded, setExpanded] = useState(false);

  const activeTags = selectedTags || [];

  function toggleTag(tagId) {
    if (activeTags.includes(tagId)) {
      onTagsChange(activeTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...activeTags, tagId]);
    }
  }

  function clearAll() {
    onTagsChange([]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter by topic
          {activeTags.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-[color:var(--lux-accent)] text-black rounded">
              {activeTags.length}
            </span>
          )}
        </button>
        {activeTags.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-[color:var(--lux-foreground-40)] hover:text-[color:var(--lux-foreground)] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {expanded && (
        <div className="p-4 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/50 space-y-4">
          {showCategories.map(catKey => {
            const category = TAG_CATEGORIES[catKey];
            if (!category) return null;

            return (
              <div key={catKey}>
                <div className="text-xs text-[color:var(--lux-foreground-40)] uppercase tracking-wider mb-2">
                  {category.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map(tag => {
                    const isActive = activeTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`
                          px-3 py-1.5 text-xs font-medium transition-all
                          ${isActive 
                            ? 'text-black' 
                            : 'text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)]'
                          }
                        `}
                        style={{
                          backgroundColor: isActive ? tag.color : 'transparent',
                          border: `1px solid ${isActive ? tag.color : 'var(--lux-foreground-10)'}`,
                        }}
                      >
                        {tag.label}
                        {isActive && <X className="inline w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Tags Display */}
      {!expanded && activeTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeTags.map(tagId => {
            const allTags = Object.values(TAG_CATEGORIES).flatMap(c => c.tags);
            const tag = allTags.find(t => t.id === tagId);
            if (!tag) return null;

            return (
              <button
                key={tagId}
                onClick={() => toggleTag(tagId)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-black"
                style={{ backgroundColor: tag.color }}
              >
                {tag.label}
                <X className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Series Selector - For pillar pages
 */
export function SeriesSelector({ pillar, selectedSeries, onSeriesChange }) {
  const config = PILLAR_CONFIG[pillar];
  if (!config?.series?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSeriesChange(null)}
        className={`
          px-4 py-2 text-sm font-medium transition-colors
          ${!selectedSeries 
            ? 'bg-[color:var(--lux-accent)] text-black' 
            : 'border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)]'
          }
        `}
      >
        All {config.title}
      </button>
      {config.series.map(series => (
        <button
          key={series.id}
          onClick={() => onSeriesChange(series.id)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors
            ${selectedSeries === series.id 
              ? 'bg-[color:var(--lux-accent)] text-black' 
              : 'border border-[color:var(--lux-foreground-10)] text-[color:var(--lux-foreground-60)] hover:text-[color:var(--lux-foreground)]'
            }
          `}
          title={series.description}
        >
          {series.name}
        </button>
      ))}
    </div>
  );
}

/**
 * Authority Badges Display
 */
export function AuthorityBadges({ badges = ['AMFI'] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badgeId => {
        const badge = AUTHORITY_BADGES[badgeId];
        if (!badge) return null;

        return (
          <span
            key={badgeId}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[color:var(--lux-accent)]/30 text-[color:var(--lux-accent)] bg-[color:var(--lux-accent)]/5"
            title={badge.tooltip}
          >
            {badge.icon} {badge.label}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Reading Time & Meta Display
 */
export function PostMeta({ post, showBadges = true }) {
  const enhanced = enhancePost(post);
  if (!enhanced) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-[color:var(--lux-foreground-40)]">
      <span className="flex items-center gap-1.5">
        <Calendar className="w-4 h-4" />
        {formatDate(enhanced.published)}
      </span>
      {enhanced.lastUpdated && enhanced.lastUpdated !== enhanced.published && (
        <span className="text-[color:var(--lux-foreground-60)]">
          Updated {formatDate(enhanced.lastUpdated)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <User className="w-4 h-4" />
        {enhanced.author}
      </span>
      {showBadges && enhanced.badges?.length > 0 && (
        <AuthorityBadges badges={enhanced.badges} />
      )}
    </div>
  );
}

/**
 * TL;DR Block
 */
export function TldrBlock({ post }) {
  const enhanced = enhancePost(post);
  if (!enhanced?.tldr) return null;

  return (
    <div className="p-4 md:p-6 border-l-4 border-[color:var(--lux-accent)] bg-[color:var(--lux-accent)]/5">
      <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--lux-accent)] mb-2">
        TL;DR — The Quick Answer
      </div>
      <p className="text-[color:var(--lux-foreground-80)] leading-relaxed">
        {enhanced.tldr}
      </p>
    </div>
  );
}

/**
 * Key Numbers Block
 */
export function KeyNumbersBlock({ post }) {
  const enhanced = enhancePost(post);
  if (!enhanced?.keyNumbers?.length) return null;

  return (
    <div className="p-4 md:p-6 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/50">
      <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--lux-foreground-40)] mb-4">
        Key Numbers
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {enhanced.keyNumbers.map((num, i) => (
          <div key={i} className="text-center p-3 bg-[color:var(--lux-background)]">
            <div className="text-2xl md:text-3xl font-bold text-[color:var(--lux-accent)]">
              {num.value}
            </div>
            <div className="text-sm font-medium text-[color:var(--lux-foreground)]">
              {num.label}
            </div>
            {num.context && (
              <div className="text-xs text-[color:var(--lux-foreground-40)] mt-1">
                {num.context}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  FeaturedCard,
  PostCard,
  TagFilter,
  SeriesSelector,
  AuthorityBadges,
  PostMeta,
  TldrBlock,
  KeyNumbersBlock,
};
