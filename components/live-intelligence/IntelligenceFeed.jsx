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
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

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
        return;
      } else {
        setItems([]);
      }
    } catch (err) {
      console.warn('IntelligenceFeed: Live items unavailable:', err.message);
      setItems([]);
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
