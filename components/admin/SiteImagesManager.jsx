'use client';

/**
 * SiteImagesManager v3 — Complete admin image manager.
 * Catalogs EVERY image & video used across the entire website.
 * 50+ assets: page heroes, blog images, service graphics, branding, videos.
 * Supports Unsplash search, URL paste, preview, change history, page filters.
 * Mobile-first LUX theme.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

/* ─── Complete catalog of ALL images used across the live website ─── */
const IMAGE_CATALOG = [
  // ═══ PAGE HEROES (Unsplash backgrounds used in page headers) ═══
  { key: 'hero/home',               label: 'Home Page Hero BG',        page: 'Heroes', current: 'https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75' },
  { key: 'hero/careers',            label: 'Careers Hero BG',          page: 'Heroes', current: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75' },
  { key: 'hero/curated-partners',   label: 'Curated Partners Hero BG', page: 'Heroes', current: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80' },
  { key: 'hero/blog-index',         label: 'Blog Index Section BG',    page: 'Heroes', current: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&fm=webp&q=60' },
  { key: 'hero/itr-tool',           label: 'ITR Tool Hero',            page: 'Heroes', current: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=640&h=360&fit=crop&auto=format&q=75' },

  // ═══ SERVICE IMAGES (local PNGs in /services/) ═══
  { key: 'services/mutual-funds',   label: 'Mutual Funds',             page: 'Services', current: '/services/Mutual Funds.png' },
  { key: 'services/insurance',      label: 'Insurance',                page: 'Services', current: '/services/Insurance.png' },
  { key: 'services/fd',             label: 'Fixed Deposits',           page: 'Services', current: '/services/FD.png' },
  { key: 'services/sip',            label: 'SIP',                      page: 'Services', current: '/services/SIP.png' },
  { key: 'services/trading',        label: 'Trading Service',          page: 'Services', current: '/services/Trading Service.png' },
  { key: 'services/portfolio-mgmt', label: 'Portfolio Management',     page: 'Services', current: '/services/Portfolio Management.png' },
  { key: 'services/chatgpt-1',      label: 'ChatGPT Image 1',         page: 'Services', current: '/services/ChatGPT Image Jan 4, 2026, 10_14_56 AM.png' },
  { key: 'services/chatgpt-2',      label: 'ChatGPT Image 2',         page: 'Services', current: '/services/ChatGPT Image Jan 4, 2026, 12_53_07 PM.png' },
  { key: 'services/jan5',           label: 'Jan 5 Service Image',      page: 'Services', current: '/services/Jan 5, 2026, 04_47_36 PM.png' },

  // ═══ BLOG IMAGES — LOCAL (6 files in /blog-images/) ═══
  { key: 'blog/1-hero-47lakh',      label: 'Blog 1: 47 Lakh Mistake',  page: 'Blog', current: '/blog-images/blog-hero-47lakh.jpg' },
  { key: 'blog/2-luxury-interior',  label: 'Blog 2: Luxury Interior',  page: 'Blog', current: '/blog-images/blog-2-luxury-interior.png.jpeg' },
  { key: 'blog/3-yacht-sunset',     label: 'Blog 3: Yacht Sunset',     page: 'Blog', current: '/blog-images/blog-3-yacht-sunset.png.jpeg' },
  { key: 'blog/4-yacht-deck',       label: 'Blog 4: Yacht Deck',       page: 'Blog', current: '/blog-images/blog-4-yacht-deck.png.jpeg' },
  { key: 'blog/5-yacht-aerial',     label: 'Blog 5: Yacht Aerial',     page: 'Blog', current: '/blog-images/blog-5-yacht-aerial.png.jpeg' },
  { key: 'blog/11-credit-card',     label: 'Blog 11: Credit Card',     page: 'Blog', current: '/blog-images/blog-11-credit-card.svg' },

  // ═══ BLOG IMAGES — UNSPLASH (blogs 6-10, 12) ═══
  { key: 'blog/6-real-estate',      label: 'Blog 6: Real Estate',      page: 'Blog', current: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=600&fit=crop&auto=format&fm=webp&q=85' },
  { key: 'blog/7-property',         label: 'Blog 7: Property',         page: 'Blog', current: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1200&h=600&fit=crop&auto=format&fm=webp&q=85' },
  { key: 'blog/8-luxury-property',  label: 'Blog 8: Luxury Property',  page: 'Blog', current: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=600&fit=crop&auto=format&fm=webp&q=85' },
  { key: 'blog/9-luxury-home',      label: 'Blog 9: Luxury Home',      page: 'Blog', current: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop&auto=format&fm=webp&q=85' },
  { key: 'blog/10-interior',        label: 'Blog 10: Interior',        page: 'Blog', current: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=600&fit=crop&auto=format&fm=webp&q=85' },

  // ═══ COMMUNITY POST FALLBACK IMAGES ═══
  { key: 'community/impact',        label: 'Community: Impact',        page: 'Community', current: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&h=500&fit=crop&auto=format&fm=webp&q=75' },
  { key: 'community/guest',         label: 'Community: Guest',         page: 'Community', current: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop&auto=format&fm=webp&q=75' },
  { key: 'community/dev',           label: 'Community: Dev',           page: 'Community', current: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop&auto=format&fm=webp&q=75' },
  { key: 'community/editorial',     label: 'Community: Editorial',     page: 'Community', current: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format&fm=webp&q=75' },

  // ═══ BRANDING & ICONS ═══
  { key: 'brand/logo-png',          label: 'Logo (PNG)',               page: 'Branding', current: '/logo.png' },
  { key: 'brand/logo-webp',         label: 'Logo (WebP)',              page: 'Branding', current: '/logo.webp' },
  { key: 'brand/favicon-ico',       label: 'Favicon ICO',              page: 'Branding', current: '/favicon.ico' },
  { key: 'brand/favicon-32',        label: 'Favicon 32×32',            page: 'Branding', current: '/favicon-32x32.png' },
  { key: 'brand/favicon-16',        label: 'Favicon 16×16',            page: 'Branding', current: '/favicon-16x16.png' },
  { key: 'brand/apple-touch',       label: 'Apple Touch Icon',         page: 'Branding', current: '/apple-touch-icon.png' },
  { key: 'brand/android-192',       label: 'Android Chrome 192',       page: 'Branding', current: '/android-chrome-192x192.png' },
  { key: 'brand/android-512',       label: 'Android Chrome 512',       page: 'Branding', current: '/android-chrome-512x512.png' },
  { key: 'brand/6th',               label: 'Graphic: 6th.png',         page: 'Branding', current: '/6th.png' },

  // ═══ VIDEOS ═══
  { key: 'video/about-hero',        label: 'About Us Hero Video',      page: 'Videos', current: '/videos/about-us-animated.mp4', isVideo: true },
  { key: 'video/laser-beam',        label: 'Laser Beam Effect',        page: 'Videos', current: '/videos/laser-beam.mp4', isVideo: true },

  // ═══ 3D / SPLINE ASSETS ═══
  { key: 'spline/genkub',           label: 'Spline: GenKub Scene',     page: '3D Assets', current: '/spline/genkub/scene.splinecode', isSpline: true },
  { key: 'spline/r4x',              label: 'Spline: R4X Scene',        page: '3D Assets', current: '/spline/r4x/scene.splinecode', isSpline: true },
];

const PAGES = ['All', ...([...new Set(IMAGE_CATALOG.map(i => i.page))].sort())];

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

  const [filterPage, setFilterPage] = useState('All');

  const filtered = filterPage === 'All'
    ? IMAGE_CATALOG
    : IMAGE_CATALOG.filter(i => i.page === filterPage);

  const stats = {
    total: IMAGE_CATALOG.length,
    images: IMAGE_CATALOG.filter(i => !i.isVideo && !i.isSpline).length,
    videos: IMAGE_CATALOG.filter(i => i.isVideo).length,
    spline: IMAGE_CATALOG.filter(i => i.isSpline).length,
    overridden: Object.keys(imageMap).length,
  };

  if (loading) {
    return <div className="sa-muted">Loading image catalog…</div>;
  }

  return (
    <div>
      <div className="sa-panelHead" style={{ marginBottom: 12 }}>
        <div className="sa-panelTitle">SITE IMAGES MANAGER</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="sa-miniBtn" onClick={load} disabled={loading}>Refresh</button>
          <button className="sa-miniBtn" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : `History (${history.length})`}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14, fontSize: 12, color: 'var(--sa-muted)' }}>
        <span>{stats.total} assets</span>
        <span>{stats.images} images</span>
        <span>{stats.videos} videos</span>
        <span>{stats.spline} 3D</span>
        <span style={{ color: 'rgba(214,179,106,0.8)' }}>{stats.overridden} overridden</span>
      </div>

      {note && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', marginBottom: 12, fontSize: 13 }}>{note}</div>}

      {/* Page filter pills */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {PAGES.map(p => {
          const count = p === 'All' ? IMAGE_CATALOG.length : IMAGE_CATALOG.filter(i => i.page === p).length;
          return (
            <button
              key={p}
              className={`sa-miniBtn${filterPage === p ? ' sa-miniBtnActive' : ''}`}
              onClick={() => setFilterPage(p)}
            >
              {p} ({count})
            </button>
          );
        })}
      </div>

      {/* Image grid */}
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map((item) => {
          const overrideUrl = imageMap[item.key];
          const displayUrl = overrideUrl || item.current || '';
          const isImg = !item.isVideo && !item.isSpline;

          return (
            <div key={item.key} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div className="sa-rowTitle">
                    {item.label}
                    {overrideUrl && <span style={{ marginLeft: 6, fontSize: 10, color: 'rgba(214,179,106,0.7)' }}>● overridden</span>}
                  </div>
                  <div className="sa-rowSub">{item.page} — <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{item.key}</span></div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {isImg && (
                    <button className="sa-miniBtn" onClick={() => { setEditKey(item.key); setEditUrl(overrideUrl || item.current || ''); setSearchResults([]); setSearchQ(''); }}>
                      {overrideUrl ? 'Change' : 'Override'}
                    </button>
                  )}
                  {displayUrl && (
                    <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="sa-miniBtn" style={{ textDecoration: 'none' }}>
                      View ↗
                    </a>
                  )}
                </div>
              </div>
              {displayUrl && isImg && (
                <div style={{ width: '100%', maxWidth: 260, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                  <img src={displayUrl} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                </div>
              )}
              {displayUrl && item.isVideo && (
                <div style={{ width: '100%', maxWidth: 260, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  🎬 Video — {item.current}
                </div>
              )}
              {item.isSpline && (
                <div style={{ width: '100%', maxWidth: 260, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  🎨 3D Scene — {item.current}
                </div>
              )}
              {!displayUrl && (
                <div style={{ width: '100%', maxWidth: 260, aspectRatio: '16/9', borderRadius: 8, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
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
            RECENT CHANGES ({history.length})
          </div>
          <div style={{ display: 'grid', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
            {history.slice(0, 50).map((h, i) => (
              <div key={i} className="sa-row" style={{ fontSize: 12, padding: '8px 12px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{h.key}</span>{' '}
                  <span style={{ opacity: 0.5 }}>{h.action}</span>{' '}
                  <span style={{ opacity: 0.4 }}>{new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString()}</span>
                  {h.newUrl && <div style={{ fontSize: 10, opacity: 0.4, marginTop: 2, wordBreak: 'break-all' }}>→ {h.newUrl.slice(0, 80)}</div>}
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
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
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
              {IMAGE_CATALOG.find(c => c.key === editKey)?.label || editKey}
              <span style={{ display: 'block', fontSize: 10, fontFamily: 'monospace', marginTop: 4, opacity: 0.5 }}>key: {editKey}</span>
            </div>

            {/* Current file info */}
            {(() => {
              const item = IMAGE_CATALOG.find(c => c.key === editKey);
              return item?.current ? (
                <div style={{ marginBottom: 12, fontSize: 11, color: 'var(--sa-muted)' }}>
                  Default: <span style={{ fontFamily: 'monospace' }}>{item.current.length > 60 ? item.current.slice(0, 60) + '…' : item.current}</span>
                </div>
              ) : null;
            })()}

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

            {/* Search free images */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, color: 'var(--sa-muted)' }}>
                Search Free Images (Unsplash)
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6, marginBottom: 16, maxHeight: 240, overflowY: 'auto' }}>
                {searchResults.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setEditUrl(img.url)}
                    style={{
                      aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden',
                      cursor: 'pointer', border: editUrl === img.url ? '2px solid rgba(214,179,106,0.7)' : '2px solid transparent',
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
