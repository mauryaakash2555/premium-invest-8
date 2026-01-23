/**
 * Intelligence Archive Page
 * @file app/(public)/archive/page.jsx
 * 
 * Search and browse historical market intelligence
 * Features: Search, category filter, date range, sort, pagination
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import HeadlineCard from '@/components/live-intelligence/HeadlineCard';

// Category definitions
const categories = [
  { key: 'all', label: 'All Categories', icon: '📊' },
  { key: 'market_update', label: 'Market Update', icon: '📈' },
  { key: 'market_move', label: 'Market Move', icon: '📉' },
  { key: 'regulatory', label: 'Regulatory', icon: '⚖️' },
  { key: 'opportunity', label: 'Opportunity', icon: '💎' },
  { key: 'rbi', label: 'RBI', icon: '🏦' },
  { key: 'sebi', label: 'SEBI', icon: '📋' },
  { key: 'portfolio_tip', label: 'Portfolio Tip', icon: '💡' },
  { key: 'tax_insight', label: 'Tax Insight', icon: '💰' },
  { key: 'global', label: 'Global', icon: '🌐' }
];

const dateRanges = [
  { key: '7days', label: 'Last 7 Days' },
  { key: '30days', label: 'Last 30 Days' },
  { key: '90days', label: 'Last 90 Days' },
  { key: 'all', label: 'All Time' }
];

export default function ArchivePage() {
  const [mounted, setMounted] = useState(false);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [sortBy, setSortBy] = useState('recent'); // recent | relevant
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const fetchArchive = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        dateRange: selectedDateRange,
        limit: '50',
        offset: reset ? '0' : String(offset)
      });
      
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      
      const response = await fetch(`/api/live-intelligence/archive?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setHeadlines(data.headlines || []);
          setOffset(data.headlines?.length || 0);
        } else {
          setHeadlines(prev => [...prev, ...(data.headlines || [])]);
          setOffset(prev => prev + (data.headlines?.length || 0));
        }
        
        setHasMore(data.hasMore);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch archive:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDateRange, searchQuery, offset]);
  
  // Initial fetch and filter changes
  useEffect(() => {
    setOffset(0);
    fetchArchive(true);
  }, [selectedCategory, selectedDateRange]);
  
  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      fetchArchive(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Sort headlines
  const sortedHeadlines = [...headlines].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
    }
    // Relevance (if search query exists)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      let scoreA = 0, scoreB = 0;
      
      if (a.headline?.toLowerCase().includes(q)) scoreA += 10;
      if (a.summary?.toLowerCase().includes(q)) scoreA += 5;
      if (b.headline?.toLowerCase().includes(q)) scoreB += 10;
      if (b.summary?.toLowerCase().includes(q)) scoreB += 5;
      
      return scoreB - scoreA;
    }
    return 0;
  });
  
  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('archive-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);
  
  const getCategoryIcon = (cat) => {
    return categories.find(c => c.key === cat)?.icon || '📊';
  };
  
  const getCategoryLabel = (cat) => {
    return categories.find(c => c.key === cat)?.label || cat?.replace(/_/g, ' ');
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090A0C] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--li-background, #090A0C)' }}
    >
      {/* Header */}
      <div 
        className="border-b sticky top-0 z-10 backdrop-blur-xl"
        style={{ 
          borderColor: 'var(--li-border, rgba(170,198,255,0.15))',
          background: 'var(--li-background-panel, rgba(10,15,25,0.95))'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="shrink-0">
                <Image
                  src="/logo.webp"
                  alt="BM Wealth"
                  width={48}
                  height={48}
                  className="w-10 h-10 md:w-12 md:h-12"
                  priority
                />
              </Link>
              <div>
                <h1 
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: 'var(--li-text, rgba(235,242,255,0.94))' }}
                >
                  Intelligence Archive
                </h1>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
                >
                  {total > 0 ? `Search through ${total} historical headlines` : 'Search historical headlines'}
                </p>
              </div>
            </div>
            
            <Link
              href="/live-intelligence"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0"
              style={{ 
                background: 'rgba(100, 160, 255, 0.10)',
                border: '1px solid rgba(100, 160, 255, 0.2)',
                color: 'rgba(140, 190, 255, 0.94)'
              }}
            >
              ← Back to Live
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <span 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lg"
            style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
          >
            🔍
          </span>
          <input
            id="archive-search"
            type="text"
            placeholder="Search headlines, summaries, or keywords... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-xl text-base transition-all focus:outline-none"
            style={{ 
              background: 'var(--li-card-bg, rgba(20,30,50,0.50))',
              border: '1px solid var(--li-border, rgba(170,198,255,0.15))',
              color: 'var(--li-text, rgba(235,242,255,0.94))'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          {/* Category Filter */}
          <div className="mb-4">
            <div 
              className="flex items-center gap-2 mb-2 text-sm font-medium"
              style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
            >
              🏷️ Category
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.key ? 'ring-1' : ''
                  }`}
                  style={{ 
                    background: selectedCategory === cat.key 
                      ? 'var(--li-button-hover, rgba(170,198,255,0.20))' 
                      : 'var(--li-button-bg, rgba(170,198,255,0.10))',
                    color: selectedCategory === cat.key 
                      ? 'var(--li-text, rgba(235,242,255,0.94))' 
                      : 'var(--li-text-muted, rgba(220,230,255,0.62))',
                    ringColor: 'var(--li-accent, rgba(170,198,255,0.70))'
                  }}
                >
                  <span className="mr-2">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range & Sort */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div 
                className="flex items-center gap-2 mb-2 text-sm font-medium"
                style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
              >
                📅 Date Range
              </div>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{ 
                  background: 'var(--li-card-bg, rgba(20,30,50,0.50))',
                  border: '1px solid var(--li-border, rgba(170,198,255,0.15))',
                  color: 'var(--li-text, rgba(235,242,255,0.94))'
                }}
              >
                {dateRanges.map(range => (
                  <option key={range.key} value={range.key}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <div 
                className="flex items-center gap-2 mb-2 text-sm font-medium"
                style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
              >
                📊 Sort By
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                style={{ 
                  background: 'var(--li-card-bg, rgba(20,30,50,0.50))',
                  border: '1px solid var(--li-border, rgba(170,198,255,0.15))',
                  color: 'var(--li-text, rgba(235,242,255,0.94))'
                }}
              >
                <option value="recent">Most Recent</option>
                <option value="relevant">Most Relevant</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div 
          className="mb-4 text-sm"
          style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
        >
          {sortedHeadlines.length} {sortedHeadlines.length === 1 ? 'result' : 'results'}
          {searchQuery && ` for "${searchQuery}"`}
        </div>
        
        {/* Headlines List */}
        {loading && headlines.length === 0 ? (
          <div className="text-center py-12">
            <div 
              className="inline-block w-8 h-8 border-4 rounded-full animate-spin"
              style={{ 
                borderColor: 'var(--li-border, rgba(170,198,255,0.15))',
                borderTopColor: 'var(--li-text, rgba(235,242,255,0.94))'
              }}
            />
          </div>
        ) : sortedHeadlines.length === 0 ? (
          <div 
            className="text-center py-12"
            style={{ color: 'var(--li-text-muted, rgba(220,230,255,0.62))' }}
          >
            No headlines found. Try adjusting your filters.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedHeadlines.map((headline, index) => (
              <motion.div
                key={headline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <HeadlineCard 
                  mode="archive"
                  headline={{
                    id: headline.id,
                    headline: headline.headline,
                    whyItMatters: headline.summary,
                    dataPoint: headline.data_point,
                    category: headline.category,
                    urgency: headline.urgency,
                    source: headline.source,
                    published_at: headline.published_at,
                    created_at: headline.created_at,
                    cta_button: headline.cta_button,
                    sourceUrl: headline.cta_button?.link,
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchArchive(false)}
              className="px-6 py-3 rounded-lg font-medium transition-all"
              style={{ 
                background: 'var(--li-button-bg, rgba(170,198,255,0.10))',
                color: 'var(--li-text, rgba(235,242,255,0.94))'
              }}
            >
              Load More
            </button>
          </div>
        )}
        
        {loading && headlines.length > 0 && (
          <div className="text-center py-8">
            <div 
              className="inline-block w-6 h-6 border-4 rounded-full animate-spin"
              style={{ 
                borderColor: 'var(--li-border, rgba(170,198,255,0.15))',
                borderTopColor: 'var(--li-text, rgba(235,242,255,0.94))'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
