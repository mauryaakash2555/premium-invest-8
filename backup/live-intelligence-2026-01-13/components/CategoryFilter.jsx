'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/live-intelligence/headlines';

/**
 * CategoryFilter - Horizontal scrollable category tabs
 * 
 * Filters headlines by category. "All" is selected by default.
 */
export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const categories = [
    { key: 'all', label: 'All', icon: '✨' },
    ...Object.values(CATEGORIES),
  ];

  return (
    <>
      <div className="li-category-filter">
        <div className="li-category-scroll">
          {categories.map((cat) => (
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
      `}</style>
    </>
  );
}
