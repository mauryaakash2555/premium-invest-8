'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';
import { SPEC_CATEGORIES } from '@/lib/live-intelligence/headlines';

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

// Jan 21 spec categories
const CATEGORIES = [
  SPEC_CATEGORIES.market,
  SPEC_CATEGORIES.mutual_funds,
  SPEC_CATEGORIES.breaking,
  SPEC_CATEGORIES.insurance,
  SPEC_CATEGORIES.fixed_income,
  SPEC_CATEGORIES.pms,
  SPEC_CATEGORIES.real_estate,
  SPEC_CATEGORIES.forex_gold,
];

const URGENCY_LEVELS = [
  { key: 'BREAKING', label: '🔴 Breaking', color: 'oklch(0.65 0.18 25)' },
  { key: 'IMPORTANT', label: '🟡 Important', color: 'var(--sa-accent)' },
  { key: 'PREMIUM', label: '💎 Premium', color: '#a78bfa' },
  { key: 'REGULAR', label: '🟢 Regular', color: 'oklch(0.72 0.14 155)' },
  { key: 'EDUCATIONAL', label: '🔵 Educational', color: 'oklch(0.72 0.12 240)' },
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
    category: 'market',
    urgency: 'REGULAR',
    whyItMatters: '',
    dataPoint: '',
    source: '',
    validFrom: '',
    validUntil: '',
    pinned: false,
    triggerBreakingOverlay: false,
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
        
        // Optional: trigger breaking overlay (separate from pin-to-top)
        if (form.triggerBreakingOverlay && !editingId) {
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
      category: headline.category || 'market',
      urgency: String(headline.urgency || 'REGULAR').toUpperCase(),
      whyItMatters: headline.why_it_matters || headline.block_why_it_matters || '',
      dataPoint: headline.data_point || headline.block_where_fits || '',
      source: headline.source || headline.source_name || '',
      validFrom: headline.valid_from ? headline.valid_from.slice(0, 16) : '',
      validUntil: headline.valid_until ? headline.valid_until.slice(0, 16) : '',
      pinned: Boolean(headline.pinned),
      triggerBreakingOverlay: false,
    });
    setShowForm(true);
    setShowPreview(false);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      headline: '',
      category: 'market',
      urgency: 'REGULAR',
      whyItMatters: '',
      dataPoint: '',
      source: '',
      validFrom: '',
      validUntil: '',
      pinned: false,
      triggerBreakingOverlay: false,
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
                <label>Valid From (schedule)</label>
                <input
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={(e) => setForm(f => ({ ...f, validFrom: e.target.value }))}
                />
              </div>

              <div className="li-form-row">
                <label>Valid Until (optional)</label>
                <input
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={(e) => setForm(f => ({ ...f, validUntil: e.target.value }))}
                />
              </div>
            </div>

            <div className="li-form-grid">
              <div className="li-form-row li-checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={(e) => setForm(f => ({ ...f, pinned: e.target.checked }))}
                  />
                  📌 Pin to top (override rotation)
                </label>
              </div>

              {!editingId && (
                <div className="li-form-row li-checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.triggerBreakingOverlay}
                      onChange={(e) => setForm(f => ({ ...f, triggerBreakingOverlay: e.target.checked }))}
                    />
                    🔴 Trigger breaking overlay (30s)
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
                  {CATEGORIES.find(c => c.key === form.category)?.icon} {CATEGORIES.find(c => c.key === form.category)?.label || form.category}
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
                      style={{ background: urg?.color || 'oklch(0.72 0.12 240)' }}
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
          background: linear-gradient(135deg, color-mix(in oklab, oklch(0.65 0.18 25) 20%, transparent), color-mix(in oklab, oklch(0.65 0.18 25) 10%, transparent));
          border: 1px solid color-mix(in oklab, oklch(0.65 0.18 25) 40%, transparent);
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
          0%, 100% { box-shadow: 0 0 10px color-mix(in oklab, oklch(0.65 0.18 25) 30%, transparent); }
          50% { box-shadow: 0 0 25px color-mix(in oklab, oklch(0.65 0.18 25) 60%, transparent); }
        }
        
        .li-breaking-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .li-breaking-badge {
          background: oklch(0.65 0.18 25);
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
          background: color-mix(in oklab, oklch(0.65 0.18 25) 15%, transparent);
          border: 1px solid color-mix(in oklab, oklch(0.65 0.18 25) 30%, transparent);
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
        .li-urgency-medium { background: oklch(0.72 0.12 240); }
        .li-urgency-high { background: oklch(0.78 0.10 85); }
        .li-urgency-critical { background: oklch(0.65 0.18 25); }
        
        .li-status-live {
          color: oklch(0.72 0.14 155);
          font-size: 12px;
          font-weight: 600;
        }
        
        .li-status-pending {
          color: oklch(0.78 0.10 85);
          font-size: 12px;
          font-weight: 600;
        }
        
        .li-status-expired {
          color: oklch(0.65 0.18 25);
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
          color: oklch(0.65 0.18 25) !important;
          border-color: color-mix(in oklab, oklch(0.65 0.18 25) 30%, transparent) !important;
        }
        
        .li-btn-delete:hover {
          background: color-mix(in oklab, oklch(0.65 0.18 25) 15%, transparent) !important;
        }
      `}</style>
    </div>
  );
}
