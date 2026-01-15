'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

/**
 * Live Intelligence Admin Panel
 * 
 * Features:
 * - View all headlines from intelligence_items table
 * - Add/Edit/Delete headlines
 * - Set urgency, category, valid_until
 * - Preview before publish
 * - Trigger breaking news
 */

// Comprehensive categories matching frontend CategoryFilter
const CATEGORIES = [
  // BM Wealth Services (priority)
  { key: 'bonds', label: 'Bonds & CMS', icon: '📜', group: 'services' },
  { key: 'mutual_funds', label: 'Mutual Funds', icon: '📊', group: 'services' },
  { key: 'sip', label: 'SIP', icon: '📅', group: 'services' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️', group: 'services' },
  { key: 'pms_aif', label: 'PMS & AIF', icon: '💼', group: 'services' },
  { key: 'trading', label: 'Trading', icon: '📉', group: 'services' },
  // Market Categories
  { key: 'breaking', label: 'Breaking News', icon: '🔴', group: 'markets' },
  { key: 'ipo', label: 'IPO', icon: '🚀', group: 'markets' },
  { key: 'market', label: 'Market Update', icon: '📈', group: 'markets' },
  { key: 'corporate', label: 'Corporate Actions', icon: '🏢', group: 'markets' },
  { key: 'results', label: 'Quarterly Results', icon: '📋', group: 'markets' },
  { key: 'regulatory', label: 'Regulatory', icon: '⚖️', group: 'markets' },
  { key: 'global', label: 'Global Markets', icon: '🌍', group: 'markets' },
  { key: 'sectors', label: 'Sectors', icon: '🏭', group: 'markets' },
  { key: 'economy', label: 'Economic Data', icon: '📉', group: 'markets' },
  { key: 'insider', label: 'Insider/Bulk Deals', icon: '👔', group: 'markets' },
  { key: 'fixed_income', label: 'Fixed Deposits', icon: '🏦', group: 'markets' },
  { key: 'forex_gold', label: 'Forex & Gold', icon: '🥇', group: 'markets' },
  { key: 'real_estate', label: 'Real Estate', icon: '🏠', group: 'markets' },
];

const URGENCY_LEVELS = [
  { key: 'low', label: 'Low', color: '#6b7280' },
  { key: 'medium', label: 'Medium', color: '#3b82f6' },
  { key: 'high', label: 'High', color: '#f59e0b' },
  { key: 'critical', label: 'Critical', color: '#ef4444' },
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });
  } catch {
    return iso;
  }
}

function isExpired(validUntil) {
  if (!validUntil) return false;
  return new Date(validUntil) < new Date();
}

export function LiveIntelligenceAdmin() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [breakingStatus, setBreakingStatus] = useState(null);
  
  // Form state
  const [form, setForm] = useState({
    headline: '',
    category: 'market_update',
    urgency: 'medium',
    whyItMatters: '',
    dataPoint: '',
    source: '',
    validUntil: '',
    isBreaking: false,
  });

  // Load headlines
  const loadHeadlines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/live-intelligence');
      if (r.ok && j?.headlines) {
        setHeadlines(j.headlines);
      } else {
        setError(j?.error || 'Failed to load headlines');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check breaking news status
  const checkBreakingStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/breaking-news');
      const data = await res.json();
      setBreakingStatus(data.isBreaking ? data : null);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    loadHeadlines();
    checkBreakingStatus();
  }, [loadHeadlines, checkBreakingStatus]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const endpoint = editingId 
        ? `/api/admin/live-intelligence?id=${editingId}`
        : '/api/admin/live-intelligence';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const { r, j } = await fetchAdminJSON(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (r.ok) {
        await loadHeadlines();
        resetForm();
        
        // If marked as breaking, trigger breaking news
        if (form.isBreaking && !editingId) {
          await triggerBreakingNews(j);
        }
      } else {
        setError(j?.error || 'Failed to save headline');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger breaking news
  const triggerBreakingNews = async (headline) => {
    try {
      await fetchAdminJSON('/api/breaking-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: headline.headline || form.headline,
          category: 'breaking',
          whyItMatters: headline.why_it_matters || form.whyItMatters,
          dataPoint: headline.data_point || form.dataPoint,
          source: headline.source || form.source || 'Admin',
          duration: 30000,
        }),
      });
      await checkBreakingStatus();
    } catch (err) {
      console.error('Failed to trigger breaking news:', err);
    }
  };

  // Clear breaking news
  const clearBreakingNews = async () => {
    try {
      await fetchAdminJSON('/api/breaking-news', { method: 'DELETE' });
      setBreakingStatus(null);
    } catch (err) {
      console.error('Failed to clear breaking news:', err);
    }
  };

  // Delete headline
  const handleDelete = async (id) => {
    if (!confirm('Delete this headline?')) return;
    
    try {
      const { r } = await fetchAdminJSON(`/api/admin/live-intelligence?id=${id}`, {
        method: 'DELETE',
      });
      
      if (r.ok) {
        await loadHeadlines();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit headline
  const handleEdit = (headline) => {
    setEditingId(headline.id);
    setForm({
      headline: headline.headline || headline.block_what_happened || '',
      category: headline.category || 'market_update',
      urgency: headline.urgency || 'medium',
      whyItMatters: headline.why_it_matters || headline.block_why_it_matters || '',
      dataPoint: headline.data_point || headline.block_where_fits || '',
      source: headline.source || headline.source_name || '',
      validUntil: headline.valid_until ? headline.valid_until.slice(0, 16) : '',
      isBreaking: false,
    });
    setShowForm(true);
    setShowPreview(false);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      headline: '',
      category: 'market_update',
      urgency: 'medium',
      whyItMatters: '',
      dataPoint: '',
      source: '',
      validUntil: '',
      isBreaking: false,
    });
    setEditingId(null);
    setShowForm(false);
    setShowPreview(false);
  };

  return (
    <div className="li-admin">
      {/* Breaking News Alert */}
      {breakingStatus && (
        <div className="li-breaking-alert">
          <div className="li-breaking-content">
            <span className="li-breaking-badge">🔴 BREAKING ACTIVE</span>
            <span className="li-breaking-text">{breakingStatus.headline}</span>
            <span className="li-breaking-timer">
              Expires in: {Math.round((breakingStatus.expiresIn || 0) / 1000)}s
            </span>
          </div>
          <button className="sa-miniBtn" onClick={clearBreakingNews}>
            Clear Breaking
          </button>
        </div>
      )}

      {/* Header */}
      <div className="sa-panelHead" style={{ marginBottom: 16 }}>
        <div className="sa-panelTitle">📡 LIVE INTELLIGENCE</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sa-miniBtn" onClick={loadHeadlines} disabled={loading}>
            {loading ? '...' : 'Refresh'}
          </button>
          <button 
            className="sa-btn sa-btnGold" 
            onClick={() => { resetForm(); setShowForm(true); }}
          >
            + Add Headline
          </button>
        </div>
      </div>

      {error && (
        <div className="li-error">{error}</div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="li-form-panel">
          <div className="li-form-header">
            <h3>{editingId ? 'Edit Headline' : 'Add New Headline'}</h3>
            <button className="sa-miniBtn" onClick={resetForm}>Cancel</button>
          </div>
          
          <form onSubmit={handleSubmit} className="li-form">
            <div className="li-form-row">
              <label>Headline *</label>
              <textarea
                value={form.headline}
                onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))}
                placeholder="Main headline text..."
                required
                rows={2}
              />
            </div>
            
            <div className="li-form-grid">
              <div className="li-form-row">
                <label>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="li-form-row">
                <label>Urgency *</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm(f => ({ ...f, urgency: e.target.value }))}
                >
                  {URGENCY_LEVELS.map(u => (
                    <option key={u.key} value={u.key}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="li-form-row">
              <label>Why It Matters</label>
              <textarea
                value={form.whyItMatters}
                onChange={(e) => setForm(f => ({ ...f, whyItMatters: e.target.value }))}
                placeholder="Educational explanation..."
                rows={2}
              />
            </div>
            
            <div className="li-form-grid">
              <div className="li-form-row">
                <label>Data Point</label>
                <input
                  type="text"
                  value={form.dataPoint}
                  onChange={(e) => setForm(f => ({ ...f, dataPoint: e.target.value }))}
                  placeholder="Key figure or stat..."
                />
              </div>
              
              <div className="li-form-row">
                <label>Source</label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}
                  placeholder="News source..."
                />
              </div>
            </div>
            
            <div className="li-form-grid">
              <div className="li-form-row">
                <label>Valid Until (optional)</label>
                <input
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))}
                />
              </div>
              
              {!editingId && (
                <div className="li-form-row li-checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.isBreaking}
                      onChange={(e) => setForm(f => ({ ...f, isBreaking: e.target.checked }))}
                    />
                    🔴 Trigger as Breaking News (30s interrupt)
                  </label>
                </div>
              )}
            </div>
            
            <div className="li-form-actions">
              <button 
                type="button" 
                className="sa-btn" 
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button type="submit" className="sa-btn sa-btnGold" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Publish')}
              </button>
            </div>
          </form>
          
          {/* Preview */}
          {showPreview && (
            <div className="li-preview">
              <div className="li-preview-header">Preview</div>
              <div className="li-preview-card">
                <div className="li-preview-category">
                  {CATEGORIES.find(c => c.key === form.category)?.icon} {form.category.replace('_', ' ')}
                </div>
                <div className="li-preview-headline">{form.headline || 'Headline text...'}</div>
                {form.whyItMatters && (
                  <div className="li-preview-matters">{form.whyItMatters}</div>
                )}
                <div className="li-preview-meta">
                  <span className={`li-urgency-badge li-urgency-${form.urgency}`}>
                    {form.urgency.toUpperCase()}
                  </span>
                  {form.source && <span>Source: {form.source}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Headlines List */}
      <div className="li-headlines-list">
        {loading && headlines.length === 0 ? (
          <div className="sa-muted">Loading headlines...</div>
        ) : headlines.length === 0 ? (
          <div className="sa-muted">No headlines found. Add your first headline above.</div>
        ) : (
          <>
            <div className="li-list-header">
              <span className="li-col-headline">Headline</span>
              <span className="li-col-category">Category</span>
              <span className="li-col-urgency">Urgency</span>
              <span className="li-col-status">Status</span>
              <span className="li-col-actions">Actions</span>
            </div>
            
            {headlines.map((h) => {
              const expired = isExpired(h.valid_until);
              const cat = CATEGORIES.find(c => c.key === h.category);
              const urg = URGENCY_LEVELS.find(u => u.key === h.urgency);
              
              return (
                <div 
                  key={h.id} 
                  className={`li-headline-row ${expired ? 'li-expired' : ''}`}
                >
                  <div className="li-col-headline">
                    <div className="li-headline-text">
                      {h.headline || h.block_what_happened || '(No headline)'}
                    </div>
                    <div className="li-headline-sub">
                      {h.source || h.source_name || 'Admin'} · {formatDate(h.created_at)}
                    </div>
                  </div>
                  
                  <div className="li-col-category">
                    <span className="li-category-badge">
                      {cat?.icon || '📰'} {h.category?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="li-col-urgency">
                    <span 
                      className={`li-urgency-badge li-urgency-${h.urgency || 'medium'}`}
                      style={{ background: urg?.color || '#3b82f6' }}
                    >
                      {h.urgency?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  
                  <div className="li-col-status">
                    {expired ? (
                      <span className="li-status-expired">Expired</span>
                    ) : h.status === 'processed' ? (
                      <span className="li-status-live">Live</span>
                    ) : h.status === 'pending' ? (
                      <span className="li-status-pending">Processing</span>
                    ) : (
                      <span className="li-status-live">Active</span>
                    )}
                    {h.valid_until && (
                      <div className="li-valid-until">
                        Until: {formatDate(h.valid_until)}
                      </div>
                    )}
                  </div>
                  
                  <div className="li-col-actions">
                    <button 
                      className="sa-miniBtn" 
                      onClick={() => handleEdit(h)}
                    >
                      Edit
                    </button>
                    <button 
                      className="sa-miniBtn"
                      onClick={() => triggerBreakingNews(h)}
                      title="Trigger as breaking news"
                    >
                      🔴
                    </button>
                    <button 
                      className="sa-miniBtn li-btn-delete"
                      onClick={() => handleDelete(h.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <style jsx>{`
        .li-admin {
          margin-top: 12px;
        }
        
        .li-breaking-alert {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          animation: pulseRed 2s ease-in-out infinite;
        }
        
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.6); }
        }
        
        .li-breaking-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .li-breaking-badge {
          background: #ef4444;
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        
        .li-breaking-text {
          color: var(--sa-text);
          font-weight: 600;
        }
        
        .li-breaking-timer {
          color: var(--sa-muted);
          font-size: 12px;
        }
        
        .li-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 13px;
        }
        
        .li-form-panel {
          background: var(--sa-card);
          border: 1px solid var(--sa-border);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .li-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .li-form-header h3 {
          margin: 0;
          color: var(--sa-gold2);
          font-size: 16px;
        }
        
        .li-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .li-form-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .li-form-row label {
          font-size: 12px;
          font-weight: 600;
          color: var(--sa-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .li-form-row input,
        .li-form-row select,
        .li-form-row textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--sa-border);
          border-radius: 8px;
          padding: 10px 12px;
          color: var(--sa-text);
          font-size: 14px;
        }
        
        .li-form-row textarea {
          resize: vertical;
          min-height: 60px;
        }
        
        .li-form-row input:focus,
        .li-form-row select:focus,
        .li-form-row textarea:focus {
          outline: none;
          border-color: var(--sa-gold);
        }
        
        .li-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        
        @media (max-width: 600px) {
          .li-form-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .li-checkbox-row {
          flex-direction: row !important;
          align-items: center;
          padding-top: 24px;
        }
        
        .li-checkbox-row label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          text-transform: none;
          font-size: 14px;
          color: var(--sa-text);
        }
        
        .li-checkbox-row input[type="checkbox"] {
          width: 18px;
          height: 18px;
        }
        
        .li-form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 8px;
        }
        
        .li-preview {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--sa-border);
        }
        
        .li-preview-header {
          font-size: 12px;
          font-weight: 600;
          color: var(--sa-muted);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        
        .li-preview-card {
          background: linear-gradient(180deg, rgba(20, 25, 40, 0.9), rgba(15, 18, 30, 0.95));
          border: 1px solid rgba(100, 150, 255, 0.15);
          border-radius: 16px;
          padding: 20px;
        }
        
        .li-preview-category {
          font-size: 11px;
          color: rgba(100, 150, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
        
        .li-preview-headline {
          font-size: 18px;
          font-weight: 600;
          color: rgba(235, 245, 255, 0.95);
          line-height: 1.4;
          margin-bottom: 10px;
        }
        
        .li-preview-matters {
          font-size: 14px;
          color: rgba(200, 215, 240, 0.7);
          line-height: 1.5;
          margin-bottom: 12px;
        }
        
        .li-preview-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: var(--sa-muted);
        }
        
        .li-headlines-list {
          background: var(--sa-card);
          border: 1px solid var(--sa-border);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .li-list-header {
          display: grid;
          grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1fr;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--sa-border);
          font-size: 11px;
          font-weight: 700;
          color: var(--sa-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        
        @media (max-width: 900px) {
          .li-list-header {
            display: none;
          }
        }
        
        .li-headline-row {
          display: grid;
          grid-template-columns: 2fr 1fr 0.8fr 0.8fr 1fr;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--sa-border);
          align-items: center;
        }
        
        .li-headline-row:last-child {
          border-bottom: none;
        }
        
        .li-headline-row.li-expired {
          opacity: 0.5;
        }
        
        @media (max-width: 900px) {
          .li-headline-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .li-col-actions {
            justify-content: flex-start !important;
          }
        }
        
        .li-headline-text {
          font-weight: 600;
          color: var(--sa-text);
          line-height: 1.4;
        }
        
        .li-headline-sub {
          font-size: 11px;
          color: var(--sa-muted);
          margin-top: 4px;
        }
        
        .li-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--sa-text);
          text-transform: capitalize;
        }
        
        .li-urgency-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          color: white;
          letter-spacing: 0.05em;
        }
        
        .li-urgency-low { background: #6b7280; }
        .li-urgency-medium { background: #3b82f6; }
        .li-urgency-high { background: #f59e0b; }
        .li-urgency-critical { background: #ef4444; }
        
        .li-status-live {
          color: #34d399;
          font-size: 12px;
          font-weight: 600;
        }
        
        .li-status-pending {
          color: #fbbf24;
          font-size: 12px;
          font-weight: 600;
        }
        
        .li-status-expired {
          color: #f87171;
          font-size: 12px;
          font-weight: 600;
        }
        
        .li-valid-until {
          font-size: 10px;
          color: var(--sa-muted);
          margin-top: 2px;
        }
        
        .li-col-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        
        .li-btn-delete {
          color: #f87171 !important;
          border-color: rgba(248, 113, 113, 0.3) !important;
        }
        
        .li-btn-delete:hover {
          background: rgba(248, 113, 113, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
