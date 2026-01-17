'use client';

/**
 * IntelligenceFeed - Displays intelligence items from the automated pipeline
 * 
 * Features:
 * - Fetches from /api/live-intelligence/process
 * - Category filtering
 * - Auto-refresh
 * - Fallback to static content
 * 
 * TECH RULES:
 * - NO AI calls in render tree
 * - Reads from DB only
 * - Errors fail silently with fallback UI
 */

import { useState, useEffect, useCallback } from 'react';
import IntelligenceCard from './IntelligenceCard';

// Fallback items when API/DB is not available
const FALLBACK_ITEMS = [
  {
    id: 'fallback-1',
    category: 'market_update',
    urgency: 'medium',
    block_what_happened: 'Indian markets opened flat amid mixed global cues. Nifty 50 trades near 23,500 levels.',
    block_why_it_matters: 'Flat openings often indicate market consolidation. This typically happens when investors await key economic data or global market direction before making significant moves.',
    block_where_fits: 'Affects: Equity portfolios, Mutual Funds, SIPs',
    block_who_cares: 'Active traders, SIP investors, Equity fund holders',
    block_signals: [
      { key: 'volatility_moderate', label: 'Volatility moderate' },
      { key: 'no_rebalancing', label: 'No rebalancing alerts' },
    ],
    block_source_timestamp: 'Source: Market Data | Updated just now',
  },
  {
    id: 'fallback-2',
    category: 'policy_change',
    urgency: 'high',
    block_what_happened: 'RBI maintains repo rate at 6.5% in latest monetary policy review.',
    block_why_it_matters: 'The repo rate is the rate at which RBI lends to banks. Unchanged rates indicate stable monetary policy, affecting loan EMIs, fixed deposit rates, and overall liquidity in the economy.',
    block_where_fits: 'Affects: All debt instruments, FDs, Loans, Bonds',
    block_who_cares: 'FD investors, Loan holders, Debt fund investors, Home buyers',
    block_signals: [
      { key: 'risk_unchanged', label: 'Risk score unchanged' },
      { key: 'sip_continue', label: 'SIP continuation recommended' },
    ],
    block_source_timestamp: 'Source: RBI | Updated 2 hours ago',
  },
  {
    id: 'fallback-3',
    category: 'global_market',
    urgency: 'low',
    block_what_happened: 'US markets closed higher overnight. S&P 500 gained 0.4% while Nasdaq added 0.6%.',
    block_why_it_matters: 'US market performance often influences Asian markets including India. Positive overnight cues typically support bullish sentiment in early trading sessions.',
    block_where_fits: 'Affects: International funds, Global allocation portfolios, Tech stocks',
    block_who_cares: 'Diversified investors, International fund holders, Global equity investors',
    block_signals: [
      { key: 'volatility_low', label: 'Volatility low' },
    ],
    block_source_timestamp: 'Source: Global Markets | Updated 6 hours ago',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'market_update', label: 'Markets' },
  { key: 'policy_change', label: 'Policy' },
  { key: 'economic_indicator', label: 'Economy' },
  { key: 'corporate_action', label: 'Corporate' },
  { key: 'global_market', label: 'Global' },
  { key: 'commodity', label: 'Commodities' },
];

export default function IntelligenceFeed({ limit = 10 }) {
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: String(limit) });
      if (category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`/api/live-intelligence/process?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setItems(data.items);
        setError(null);
      } else {
        // Use filtered fallback if no DB items
        const filtered = category === 'all' 
          ? FALLBACK_ITEMS 
          : FALLBACK_ITEMS.filter(item => item.category === category);
        setItems(filtered.length > 0 ? filtered : FALLBACK_ITEMS);
      }
    } catch (err) {
      console.warn('IntelligenceFeed: Using fallback data:', err.message);
      // Silent fallback - don't show error to user
      const filtered = category === 'all' 
        ? FALLBACK_ITEMS 
        : FALLBACK_ITEMS.filter(item => item.category === category);
      setItems(filtered.length > 0 ? filtered : FALLBACK_ITEMS);
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchItems();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchItems, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  return (
    <div className="li-intelligence-feed">
      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setCategory(cat.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              background: category === cat.key 
                ? 'rgba(100, 160, 255, 0.15)' 
                : 'rgba(100, 160, 255, 0.04)',
              border: `1px solid ${category === cat.key 
                ? 'rgba(100, 160, 255, 0.35)' 
                : 'rgba(100, 160, 255, 0.10)'}`,
              color: category === cat.key 
                ? 'rgba(140, 200, 255, 0.95)' 
                : 'rgba(150, 180, 220, 0.65)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && items.length === 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'rgba(170, 198, 255, 0.50)',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid rgba(170, 198, 255, 0.20)',
            borderTopColor: 'rgba(170, 198, 255, 0.70)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px',
          }} />
          Loading intelligence...
        </div>
      )}

      {/* Items Grid */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {items.map((item) => (
          <IntelligenceCard key={item.id} item={item} />
        ))}
      </div>

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'rgba(170, 198, 255, 0.50)',
          fontSize: '14px',
        }}>
          No intelligence items in this category
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export { IntelligenceFeed };
