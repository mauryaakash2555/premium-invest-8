'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { BM_WEALTH_SERVICES, MARKET_CATEGORIES } from '@/lib/live-intelligence/headlines';

/**
 * CategoryFilter - Horizontal scrollable category tabs
 * 
 * Shows services first, then market categories.
 * "All" is selected by default.
 */
export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [showAll, setShowAll] = useState(false);

  // Main tabs: All + Services (priority) + a few markets
  const serviceTabs = Object.values(BM_WEALTH_SERVICES);
  const quickMarketTabs = ['ipo', 'market', 'regulatory'].map((key) => MARKET_CATEGORIES[key]).filter(Boolean);

  const mainTabs = [
    { key: 'all', label: 'All', icon: '✨' },
    ...serviceTabs,
    ...quickMarketTabs,
  ];

  return (
    <>
      <div className="li-category-filter">
        <div className="li-category-scroll">
          <button
            type="button"
            className="li-category-tab li-category-more"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAll(true);
            }}
            aria-label="View all categories"
          >
            <span className="li-category-icon">☰</span>
            <span className="li-category-label">More</span>
          </button>

          {mainTabs.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`li-category-tab ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.key)}
            >
              <span className="li-category-icon">{cat.icon}</span>
              <span className="li-category-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showAll && typeof document !== 'undefined' && document.body
        ? createPortal(
            <div
              className="li-category-modal"
              role="dialog"
              aria-modal="true"
              aria-label="All categories"
              style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                zIndex: 99999,
              }}
              onClick={() => {
                setShowAll(false);
              }}
            >
              <div
                className="li-category-modal-panel"
                style={{
                  position: 'relative',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  backgroundColor: '#000000',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="li-category-modal-header"
                  style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#000',
                    zIndex: 10,
                    padding: '1.5rem',
                  }}
                >
                  <div className="li-category-modal-title">Categories</div>
                  <button
                    type="button"
                    className="li-category-modal-close"
                    onClick={() => {
                      setShowAll(false);
                    }}
                    aria-label="Close categories"
                  >
                    ✕
                  </button>
                </div>

                <div className="li-category-modal-list">
                  {/* All Option */}
                  <button
                    type="button"
                    className={`li-category-modal-row ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      onCategoryChange('all');
                      setShowAll(false);
                    }}
                  >
                    <span className="li-category-modal-icon">✨</span>
                    <span className="li-category-modal-label">All Categories</span>
                  </button>
                  
                  {/* Services Section */}
                  <div className="li-category-group-label">BM Wealth Services</div>
                  {Object.values(BM_WEALTH_SERVICES).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`li-category-modal-row ${selectedCategory === cat.key ? 'active' : ''}`}
                      onClick={() => {
                        onCategoryChange(cat.key);
                        setShowAll(false);
                      }}
                    >
                      <span className="li-category-modal-icon">{cat.icon}</span>
                      <span className="li-category-modal-label">{cat.label}</span>
                    </button>
                  ))}
                  
                  {/* Markets Section */}
                  <div className="li-category-group-label">Market Intelligence</div>
                  {Object.values(MARKET_CATEGORIES).map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`li-category-modal-row ${selectedCategory === cat.key ? 'active' : ''}`}
                      onClick={() => {
                        onCategoryChange(cat.key);
                        setShowAll(false);
                      }}
                    >
                      <span className="li-category-modal-icon">{cat.icon}</span>
                      <span className="li-category-modal-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      <style jsx>{`
        .li-category-filter {
          margin: 20px 0 16px;
          overflow: hidden;
        }

        .li-category-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 0 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .li-category-scroll::-webkit-scrollbar {
          display: none;
        }

        .li-category-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(20, 25, 35, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          color: rgba(200, 215, 240, 0.7);
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .li-category-more {
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.16) 0%, rgba(20, 25, 35, 0.7) 100%);
          border-color: rgba(170, 198, 255, 0.18);
          color: rgba(235, 242, 255, 0.9);
          box-shadow: 0 0 18px rgba(170, 198, 255, 0.10);
        }

        .li-category-tab:hover {
          background: rgba(30, 40, 55, 0.8);
          border-color: rgba(170, 198, 255, 0.20);
          color: rgba(235, 242, 255, 0.9);
        }

        .li-category-tab.active {
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.18) 0%, rgba(170, 198, 255, 0.08) 100%);
          border-color: rgba(170, 198, 255, 0.40);
          color: rgba(235, 242, 255, 0.95);
          box-shadow: 0 0 20px rgba(170, 198, 255, 0.12);
        }

        .li-category-icon {
          font-size: 14px;
        }

        .li-category-label {
          letter-spacing: 0.02em;
        }

        @media (max-width: 640px) {
          .li-category-tab {
            padding: 6px 12px;
            font-size: 12px;
          }

          .li-category-icon {
            font-size: 13px;
          }
        }

        /* Full list modal (centered on viewport) */
        .li-category-modal {
          padding: 16px;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          transform: none !important;
          margin: 0 !important;
        }

        .li-category-modal-panel {
          width: 100%;
          max-width: 560px;
          max-height: 80vh;
          overflow: hidden;
          margin: auto !important;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(18, 22, 30, 0.98) 0%, rgba(10, 10, 12, 0.99) 100%);
          border: 1px solid rgba(170, 198, 255, 0.16);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.60), 0 0 100px rgba(100, 160, 255, 0.06);
          position: relative;
          z-index: 1;
        }

        .li-category-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.10);
        }

        .li-category-modal-title {
          color: rgba(235, 242, 255, 0.95);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .li-category-modal-close {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(200, 215, 240, 0.8);
          cursor: pointer;
        }

        .li-category-modal-list {
          overflow-y: auto;
          padding: 10px;
          max-height: calc(80vh - 56px);
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          /* Premium visible scrollbar with gradient glow */
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 160, 255, 0.5) rgba(20, 25, 35, 0.6);
        }

        /* Webkit (Chrome, Safari, Edge) scrollbar */
        .li-category-modal-list::-webkit-scrollbar {
          width: 8px;
        }
        .li-category-modal-list::-webkit-scrollbar-track {
          background: rgba(20, 25, 35, 0.6);
          border-radius: 8px;
        }
        .li-category-modal-list::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(100, 160, 255, 0.7) 0%, rgba(140, 190, 255, 0.5) 100%);
          border-radius: 8px;
          box-shadow: 0 0 8px rgba(100, 160, 255, 0.4), inset 0 0 4px rgba(200, 220, 255, 0.3);
        }
        .li-category-modal-list::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(120, 180, 255, 0.9) 0%, rgba(160, 200, 255, 0.7) 100%);
          box-shadow: 0 0 12px rgba(100, 160, 255, 0.6), inset 0 0 6px rgba(200, 220, 255, 0.4);
        }

        .li-category-modal-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 12px;
          background: rgba(20, 25, 35, 0.70);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          cursor: pointer;
          color: rgba(235, 242, 255, 0.92);
          text-align: left;
        }

        .li-category-modal-row.active {
          border-color: rgba(170, 198, 255, 0.40);
          box-shadow: 0 0 30px rgba(170, 198, 255, 0.10);
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.14) 0%, rgba(20, 25, 35, 0.70) 100%);
        }

        .li-category-modal-icon {
          font-size: 16px;
          width: 22px;
          text-align: center;
        }

        .li-category-modal-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        
        .li-category-group-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(170, 198, 255, 0.6);
          padding: 16px 12px 8px;
          margin-top: 4px;
        }
        
        .li-category-group-label:first-of-type {
          margin-top: 0;
        }
      `}</style>
    </>
  );
}
