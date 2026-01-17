'use client';

/**
 * MarketMoodIndicator - Global market sentiment display
 * Shows what the market is saying - similar to Bloomberg/Reuters style
 * 
 * @file components/live-intelligence/MarketMoodIndicator.jsx
 */

import { useState, useEffect } from 'react';

// Market mood levels with colors (laser blue theme - NO gold/tan/orange)
const MOOD_LEVELS = {
  'very_bullish': {
    label: 'Very Bullish',
    icon: '🚀',
    color: 'rgba(100, 220, 140, 0.95)',
    bgColor: 'rgba(100, 220, 140, 0.12)',
    borderColor: 'rgba(100, 220, 140, 0.25)',
    description: 'Strong positive sentiment - markets charging ahead',
  },
  'bullish': {
    label: 'Bullish',
    icon: '📈',
    color: 'rgba(120, 200, 160, 0.95)',
    bgColor: 'rgba(120, 200, 160, 0.10)',
    borderColor: 'rgba(120, 200, 160, 0.20)',
    description: 'Positive outlook - investors feeling confident',
  },
  'cautiously_optimistic': {
    label: 'Cautiously Optimistic',
    icon: '🔵',
    color: 'rgba(140, 190, 255, 0.95)',
    bgColor: 'rgba(140, 190, 255, 0.10)',
    borderColor: 'rgba(140, 190, 255, 0.20)',
    description: 'Careful optimism - watching for confirmation',
  },
  'neutral': {
    label: 'Neutral',
    icon: '⚖️',
    color: 'rgba(180, 195, 220, 0.85)',
    bgColor: 'rgba(180, 195, 220, 0.08)',
    borderColor: 'rgba(180, 195, 220, 0.15)',
    description: 'Markets digesting information - no clear direction',
  },
  'cautious': {
    label: 'Cautious',
    icon: '⚠️',
    color: 'rgba(180, 160, 220, 0.95)',
    bgColor: 'rgba(180, 160, 220, 0.10)',
    borderColor: 'rgba(180, 160, 220, 0.20)',
    description: 'Uncertainty rising - investors pulling back',
  },
  'bearish': {
    label: 'Bearish',
    icon: '📉',
    color: 'rgba(255, 140, 140, 0.95)',
    bgColor: 'rgba(255, 140, 140, 0.10)',
    borderColor: 'rgba(255, 140, 140, 0.20)',
    description: 'Negative sentiment - risk-off mode active',
  },
};

export default function MarketMoodIndicator() {
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchMarketMood();
  }, []);

  const fetchMarketMood = async () => {
    try {
      const response = await fetch('/api/live-intelligence/mood');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.mood) {
          // Map API mood_type to our level
          const levelMap = {
            'bullish': 'bullish',
            'very_bullish': 'very_bullish',
            'bearish': 'bearish',
            'volatile': 'cautious',
            'mixed': 'neutral',
            'neutral': 'neutral',
            'cautiously_optimistic': 'cautiously_optimistic',
          };
          
          setMood({
            level: levelMap[data.mood.mood_type] || 'neutral',
            summary: data.mood.mood_text || 'Market data loading...',
            factors: [],
            lastUpdated: data.mood.generated_at || data.mood.created_at || new Date().toISOString(),
          });
        } else {
          throw new Error('Invalid response');
        }
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      console.error('Failed to fetch market mood:', error);
      setMood({
        level: 'neutral',
        summary: 'Markets processing new information',
        factors: [],
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(20, 30, 50, 0.6)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        border: '1px solid rgba(100, 160, 255, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(100, 160, 255, 0.3)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ color: 'rgba(180, 195, 220, 0.6)', fontSize: '14px' }}>
            Loading market mood...
          </span>
        </div>
      </div>
    );
  }

  if (!mood) return null;

  const moodConfig = MOOD_LEVELS[mood.level] || MOOD_LEVELS.neutral;

  return (
    <div 
      style={{
        background: `linear-gradient(135deg, ${moodConfig.bgColor} 0%, rgba(20, 30, 50, 0.6) 100%)`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        border: `1px solid ${moodConfig.borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = moodConfig.color;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = moodConfig.borderColor;
      }}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{moodConfig.icon}</span>
          <div>
            <div style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(180, 195, 220, 0.55)',
              marginBottom: '2px',
            }}>
              Market Mood
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: moodConfig.color,
            }}>
              {moodConfig.label}
            </div>
          </div>
        </div>
        
        <div style={{
          fontSize: '18px',
          color: 'rgba(180, 195, 220, 0.4)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          ▼
        </div>
      </div>

      {/* Summary - always visible */}
      <p style={{
        color: 'rgba(220, 235, 255, 0.75)',
        fontSize: '13px',
        margin: '10px 0 0',
        lineHeight: 1.5,
      }}>
        {mood.summary || moodConfig.description}
      </p>

      {/* Expanded Section */}
      {expanded && mood.factors && mood.factors.length > 0 && (
        <div style={{
          marginTop: '14px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(100, 160, 255, 0.1)',
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'rgba(140, 180, 255, 0.6)',
            marginBottom: '8px',
          }}>
            Key Factors
          </div>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}>
            {mood.factors.map((factor, idx) => (
              <li key={idx} style={{
                color: 'rgba(200, 215, 240, 0.75)',
                fontSize: '12px',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <span style={{ color: moodConfig.color }}>•</span>
                {factor}
              </li>
            ))}
          </ul>
          
          {mood.lastUpdated && (
            <div style={{
              marginTop: '12px',
              fontSize: '10px',
              color: 'rgba(180, 195, 220, 0.4)',
            }}>
              Last updated: {new Date(mood.lastUpdated).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
