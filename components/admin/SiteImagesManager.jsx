'use client';

/**
 * SiteImagesManager — Admin component to browse, update, and search images used across the site.
 * Mobile-first LUX theme. Supports Unsplash search + direct URL paste.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

const DEFAULT_KEYS = [
  { key: 'hero-bg', label: 'Home Hero Background', page: 'Home' },
  { key: 'about-banner', label: 'About Page Banner', page: 'About' },
  { key: 'about-team', label: 'About Team Photo', page: 'About' },
  { key: 'services-mf', label: 'Services: Mutual Funds', page: 'Services' },
  { key: 'services-tax', label: 'Services: Tax Planning', page: 'Services' },
  { key: 'services-insurance', label: 'Services: Insurance', page: 'Services' },
  { key: 'services-equity', label: 'Services: Equity', page: 'Services' },
  { key: 'contact-header', label: 'Contact Page Header', page: 'Contact' },
  { key: 'careers-header', label: 'Careers Page Header', page: 'Careers' },
  { key: 'blog-fallback', label: 'Blog Default Thumbnail', page: 'Blog' },
  { key: 'itr-tool-og', label: 'ITR Tool OG Image', page: 'Tools' },
  { key: 'live-intel-bg', label: 'Live Intelligence BG', page: 'Intelligence' },
  { key: 'store-hero', label: 'Store Hero Image', page: 'Store' },
];

export function SiteImagesManager() {
  const [imageMap, setImageMap] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const [editKey, setEditKey] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const showNote = useCallback((msg, ms = 3000) => {
    setNote(msg);
    setTimeout(() => setNote(''), ms);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/site-images');
      if (r.ok && j?.ok) {
        setImageMap(j.data?.images || {});
        setHistory(j.data?.history || []);
      } else {
        showNote('Failed to load images config');
      }
    } catch {
      showNote('Network error');
    } finally {
      setLoading(false);
    }
  }, [showNote]);

  useEffect(() => { load(); }, [load]);

  const saveImage = useCallback(async (key, url) => {
    setSaving(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', key, url }),
      });
      if (r.ok && j?.ok) {
        setImageMap(j.data?.images || {});
        setHistory(j.data?.history || []);
        showNote(`Updated "${key}" ✅`);
        setEditKey(null);
      } else {
        showNote('Save failed');
      }
    } catch {
      showNote('Network error');
    } finally {
      setSaving(false);
    }
  }, [showNote]);

  const doSearch = useCallback(async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const { r, j } = await fetchAdminJSON(`/api/admin/search-images?q=${encodeURIComponent(searchQ.trim())}`);
      if (r.ok && j?.results) {
        setSearchResults(j.results);
      } else {
        showNote('Search failed');
      }
    } catch {
      showNote('Search error');
    } finally {
      setSearching(false);
    }
  }, [searchQ, showNote]);

  if (loading) {
    return <div className="sa-muted">Loading site images…</div>;
  }

  return (
    <div>
      <div className="sa-panelHead" style={{ marginBottom: 16 }}>
        <div className="sa-panelTitle">SITE IMAGES MANAGER</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="sa-miniBtn" onClick={load} disabled={loading}>Refresh</button>
          <button className="sa-miniBtn" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : 'History'}
          </button>
        </div>
      </div>

      {note && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', marginBottom: 12, fontSize: 13 }}>{note}</div>}

      {/* Image grid */}
      <div style={{ display: 'grid', gap: 10 }}>
        {DEFAULT_KEYS.map(({ key, label, page }) => {
          const url = imageMap[key] || '';
          return (
            <div key={key} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div>
                  <div className="sa-rowTitle">{label}</div>
                  <div className="sa-rowSub">{page} — {key}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="sa-miniBtn" onClick={() => { setEditKey(key); setEditUrl(url); setSearchResults([]); setSearchQ(''); }}>
                    {url ? 'Change' : 'Set'}
                  </button>
                </div>
              </div>
              {url && (
                <div style={{ width: '100%', maxWidth: 280, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                  <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
              )}
              {!url && (
                <div style={{ width: '100%', maxWidth: 280, aspectRatio: '16/9', borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                  No image set
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Change history */}
      {showHistory && history.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--sa-muted)' }}>
            RECENT CHANGES
          </div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
            {history.slice(0, 30).map((h, i) => (
              <div key={i} className="sa-row" style={{ fontSize: 12, padding: '8px 12px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{h.key}</span>{' '}
                  <span style={{ opacity: 0.5 }}>{h.action}</span>{' '}
                  <span style={{ opacity: 0.4 }}>{new Date(h.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editKey && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'grid', placeItems: 'center',
          padding: 16, overflowY: 'auto',
        }}>
          <div style={{
            width: '100%', maxWidth: 520,
            background: 'var(--sa-card-solid, #1a1a1a)', border: '1px solid var(--sa-border)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              Change Image
            </div>
            <div className="sa-rowSub" style={{ marginBottom: 16 }}>
              {DEFAULT_KEYS.find(dk => dk.key === editKey)?.label || editKey}
            </div>

            {/* URL input */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, color: 'var(--sa-muted)' }}>
                Image URL
              </label>
              <input
                className="sa-loginInput"
                style={{ width: '100%' }}
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {editUrl && (
              <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', maxWidth: 320, aspectRatio: '16/9' }}>
                <img src={editUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, color: 'var(--sa-muted)' }}>
                Search Free Images
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="sa-loginInput"
                  style={{ flex: 1 }}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="e.g. finance, office, nature"
                  onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                />
                <button className="sa-miniBtn sa-miniBtnActive" onClick={doSearch} disabled={searching}>
                  {searching ? '…' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 6, marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
                {searchResults.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setEditUrl(img.url)}
                    style={{
                      aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden',
                      cursor: 'pointer', border: editUrl === img.url ? '2px solid var(--sa-accent, #8B6914)' : '2px solid transparent',
                      background: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <img src={img.thumb || img.url} alt={img.alt || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="sa-btn" onClick={() => setEditKey(null)}>Cancel</button>
              <button className="sa-btn sa-btnAccent" onClick={() => saveImage(editKey, editUrl)} disabled={saving || !editUrl.trim()}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
