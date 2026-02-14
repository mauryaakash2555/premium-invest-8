'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

/* ── style helpers ──────────────────────────────────────────────── */
const S = {
  blue: 'rgba(170,198,255,1)',
  blueBg: 'rgba(170,198,255,0.12)',
  blueHover: 'rgba(170,198,255,0.20)',
  blueBorder: 'rgba(170,198,255,0.35)',
  glass: 'rgba(0,0,0,0.25)',
  border: 'rgba(255,255,255,0.10)',
  muted: 'rgba(255,255,255,0.55)',
  sub: 'rgba(255,255,255,0.35)',
};

const btn = (active) => ({
  padding: '8px 16px',
  background: active ? S.blueBg : 'transparent',
  border: `1px solid ${active ? S.blueBorder : S.border}`,
  color: active ? S.blue : S.muted,
  cursor: 'pointer',
  fontSize: '13px',
  borderRadius: '6px',
  transition: 'all 0.15s',
});

/**
 * Blog Images Manager — Super Admin
 *
 * Multi-source image picker: Unsplash (API key in Vercel), Lorem Picsum (free,
 * no key), paste-a-URL.  Supports paginated "Load More", history & revert.
 */
export function BlogImagesManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePillar, setActivePillar] = useState('all');
  const [pillars, setPillars] = useState({});

  /* ── image search ──────────────────────────────── */
  const [searchSource, setSearchSource] = useState('unsplash');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);

  /* ── direct URL pasting ────────────────────────── */
  const [directUrl, setDirectUrl] = useState('');

  /* ── selected blog ─────────────────────────────── */
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const pillarLabels = {
    all: 'All Blogs',
    editorial: 'BM Editorial',
    impact: 'Community Impact',
    guest: 'Guest Columns',
    dev: 'Developer Insight',
  };

  const sourceLabels = {
    unsplash: 'Unsplash',
    picsum: 'Lorem Picsum (free)',
    url: 'Paste URL',
  };

  /* ── load blogs ────────────────────────────────── */
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { r, j } = await fetchAdminJSON(`/api/admin/blog-images?pillar=${activePillar}`);
      if (r.ok && j?.success) {
        setBlogs(j.blogs || []);
        setPillars(j.pillars || {});
      } else {
        setError(j?.error || 'Failed to load blogs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activePillar]);

  useEffect(() => { loadBlogs(); }, [loadBlogs]);

  /* ── search images ─────────────────────────────── */
  const doSearch = async (page = 1) => {
    if (searchSource === 'url') return; // no search for direct URL
    if (searchSource === 'unsplash' && !searchKeyword.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const payload = { action: 'search', source: searchSource, page, perPage: 12 };
      if (searchSource === 'unsplash') payload.keyword = searchKeyword;

      const { r, j } = await fetchAdminJSON('/api/admin/blog-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok && j?.success) {
        const imgs = j.images || [];
        if (page === 1) {
          setSearchResults(imgs);
        } else {
          setSearchResults((prev) => [...prev, ...imgs]);
        }
        setSearchPage(page);
        setSearchTotal(j.total || 0);
        // Has more? unsplash tells totalPages; picsum always has more
        if (searchSource === 'unsplash') {
          setHasMoreResults(page < (j.totalPages || 1));
        } else {
          setHasMoreResults(imgs.length >= 12);
        }
      } else {
        if (page === 1) setSearchResults([]);
        setError(j?.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchPage(1);
    doSearch(1);
  };

  const handleLoadMore = () => {
    doSearch(searchPage + 1);
  };

  /* ── update image ──────────────────────────────── */
  const handleUpdateImage = async (imageUrl, imageSource = searchSource) => {
    if (!selectedBlog || !imageUrl) return;

    setActionLoading(selectedBlog.id);
    setError(null);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/blog-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          blogId: selectedBlog.id,
          pillar: selectedBlog.pillar,
          imageUrl,
          imageSource,
          currentImage: selectedBlog.image_url,
        }),
      });

      if (r.ok && j?.success) {
        setSuccessMsg(`Image updated for "${selectedBlog.title}"`);
        setTimeout(() => setSuccessMsg(''), 3000);
        await loadBlogs();
        setSelectedBlog(null);
        setSearchResults([]);
        setSearchKeyword('');
        setDirectUrl('');
      } else {
        setError(j?.error || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── revert image ──────────────────────────────── */
  const handleRevert = async (imageUrl) => {
    if (!selectedBlog) return;

    setActionLoading(selectedBlog.id);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/blog-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revert',
          blogId: selectedBlog.id,
          pillar: selectedBlog.pillar,
          imageUrl,
        }),
      });

      if (r.ok && j?.success) {
        setSuccessMsg('Image reverted');
        setTimeout(() => setSuccessMsg(''), 3000);
        await loadBlogs();
        setSelectedBlog(null);
        setShowHistory(false);
      } else {
        setError(j?.error || 'Revert failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ── close editor ──────────────────────────────── */
  const closeEditor = () => {
    setSelectedBlog(null);
    setSearchResults([]);
    setSearchKeyword('');
    setDirectUrl('');
    setShowHistory(false);
    setSearchPage(1);
  };

  const filteredBlogs = activePillar === 'all' ? blogs : blogs.filter((b) => b.pillar === activePillar);

  /* ────────────────────── RENDER ────────────────── */
  return (
    <div className="sa-panel">
      {/* ── Header ── */}
      <div className="sa-panelHead">
        <div className="sa-panelTitle">BLOG IMAGES MANAGER</div>
        <button className="sa-miniBtn" onClick={loadBlogs} disabled={loading}>
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {/* ── Success ── */}
      {successMsg && (
        <div style={{ padding: '10px 16px', background: 'rgba(100,255,150,0.1)', border: '1px solid rgba(100,255,150,0.3)', marginBottom: 14, fontSize: 13, color: 'rgba(150,255,180,0.95)', borderRadius: 6 }}>
          {successMsg}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: '10px 16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', marginBottom: 14, fontSize: 13, color: 'rgba(255,200,200,0.9)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* ── Pillar Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', borderBottom: `1px solid ${S.border}`, paddingBottom: 12 }}>
        {Object.entries(pillarLabels).map(([key, label]) => (
          <button key={key} onClick={() => { setActivePillar(key); closeEditor(); }} style={btn(activePillar === key)}>
            {label}{pillars[key] !== undefined ? ` (${pillars[key]})` : ''}
          </button>
        ))}
      </div>

      {/* ══════════ SELECTED BLOG EDITOR ══════════ */}
      {selectedBlog && (
        <div style={{ background: S.glass, border: `1px solid ${S.blueBorder}`, borderRadius: 8, padding: 20, marginBottom: 20 }}>
          {/* ── title row ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: S.blue }}>{selectedBlog.title}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: S.muted }}>{pillarLabels[selectedBlog.pillar]} · {selectedBlog.author}</p>
            </div>
            <button onClick={closeEditor} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
          </div>

          {/* ── current image ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: S.muted, marginBottom: 6 }}>Current Image:</div>
            {selectedBlog.image_url ? (
              <img src={selectedBlog.image_url} alt={selectedBlog.title} style={{ maxWidth: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 6, border: `1px solid ${S.border}` }} />
            ) : (
              <div style={{ padding: 40, background: 'rgba(255,255,255,0.04)', textAlign: 'center', color: S.sub, borderRadius: 6 }}>No image set</div>
            )}
            {selectedBlog.image_overridden && (
              <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,200,100,0.8)' }}>Image overridden from original</div>
            )}
          </div>

          {/* ── history toggle ── */}
          {selectedBlog.image_history?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setShowHistory(!showHistory)} style={btn(showHistory)}>
                {showHistory ? 'Hide History' : `Previous Images (${selectedBlog.image_history.length})`}
              </button>
            </div>
          )}

          {/* ── history grid ── */}
          {showHistory && selectedBlog.image_history?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 8 }}>Click to revert:</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {selectedBlog.image_history.map((h, i) => (
                  <div key={i} onClick={() => handleRevert(h.url)} style={{ cursor: 'pointer', border: '2px solid transparent', borderRadius: 4, overflow: 'hidden', position: 'relative', transition: 'border-color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = S.blue)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                    <img src={h.url} alt={`Prev ${i + 1}`} style={{ width: 120, height: 80, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '2px 6px', fontSize: 10, textAlign: 'center' }}>
                      {h.source} · {new Date(h.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── image source tabs ── */}
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 8 }}>Choose image source:</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {Object.entries(sourceLabels).map(([key, label]) => (
              <button key={key} onClick={() => { setSearchSource(key); setSearchResults([]); setSearchPage(1); setSearchKeyword(''); setDirectUrl(''); }} style={btn(searchSource === key)}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Unsplash search ── */}
          {searchSource === 'unsplash' && (
            <div>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="e.g. finance, investment, India office" style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${S.border}`, borderRadius: 6, color: 'inherit', fontSize: 13 }} />
                <button type="submit" disabled={searching || !searchKeyword.trim()} style={{ ...btn(true), opacity: searching || !searchKeyword.trim() ? 0.4 : 1 }}>
                  {searching ? 'Searching…' : 'Search Unsplash'}
                </button>
              </form>
              {searchTotal > 0 && <div style={{ fontSize: 11, color: S.sub, marginBottom: 8 }}>{searchTotal.toLocaleString()} results · page {searchPage}</div>}
            </div>
          )}

          {/* ── Picsum browse ── */}
          {searchSource === 'picsum' && (
            <div style={{ marginBottom: 12 }}>
              <button onClick={() => doSearch(1)} disabled={searching} style={{ ...btn(true), opacity: searching ? 0.4 : 1 }}>
                {searching ? 'Loading…' : searchResults.length ? 'Reload' : 'Browse Free Photos'}
              </button>
              <span style={{ marginLeft: 10, fontSize: 11, color: S.sub }}>High-quality CC0 photos · no API key needed</span>
            </div>
          )}

          {/* ── Direct URL ── */}
          {searchSource === 'url' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="url" value={directUrl} onChange={(e) => setDirectUrl(e.target.value)} placeholder="https://example.com/image.jpg" style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${S.border}`, borderRadius: 6, color: 'inherit', fontSize: 13 }} />
              <button onClick={() => handleUpdateImage(directUrl.trim(), 'url')} disabled={!directUrl.trim() || actionLoading} style={{ ...btn(true), opacity: !directUrl.trim() ? 0.4 : 1 }}>
                Use This Image
              </button>
            </div>
          )}

          {/* ── Direct URL preview ── */}
          {searchSource === 'url' && directUrl.trim() && (
            <div style={{ marginBottom: 12 }}>
              <img src={directUrl.trim()} alt="Preview" style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 6, border: `1px solid ${S.border}` }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          )}

          {/* ── Search Results Grid ── */}
          {searchResults.length > 0 && searchSource !== 'url' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {searchResults.map((img) => (
                  <div key={img.id} onClick={() => handleUpdateImage(img.url, img.provider || searchSource)} style={{ cursor: actionLoading ? 'wait' : 'pointer', border: '2px solid transparent', borderRadius: 6, overflow: 'hidden', position: 'relative', opacity: actionLoading ? 0.5 : 1, transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.borderColor = S.blue; }}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                    <img src={img.thumb} alt={img.alt} loading="lazy" style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '3px 6px', fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{img.photographer ? `📷 ${img.photographer}` : ''}</span>
                      <span style={{ opacity: 0.6 }}>{img.provider}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Load More ── */}
              {hasMoreResults && (
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <button onClick={handleLoadMore} disabled={searching} style={{ ...btn(true), opacity: searching ? 0.4 : 1, padding: '10px 32px' }}>
                    {searching ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════ BLOG LIST ══════════ */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: S.muted }}>Loading blogs…</div>
      ) : filteredBlogs.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: S.muted }}>No blogs found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {filteredBlogs.map((blog) => {
            const sel = selectedBlog?.id === blog.id;
            return (
              <div key={blog.id} onClick={() => { setSelectedBlog(blog); setShowHistory(false); setSearchResults([]); setSearchKeyword(''); setDirectUrl(''); setSearchPage(1); }}
                style={{ background: sel ? S.blueBg : S.glass, border: `1px solid ${sel ? S.blueBorder : S.border}`, borderRadius: 8, padding: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.borderColor = S.blueBorder; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.borderColor = S.border; }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* thumb */}
                  <div style={{ flexShrink: 0 }}>
                    {blog.image_url ? (
                      <img src={blog.image_url} alt="" style={{ width: 88, height: 64, objectFit: 'cover', borderRadius: 4, border: `1px solid ${S.border}` }} />
                    ) : (
                      <div style={{ width: 88, height: 64, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: 24, color: S.sub }}>🖼️</div>
                    )}
                  </div>
                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{blog.title}</div>
                    <div style={{ fontSize: 11, color: S.muted }}>{pillarLabels[blog.pillar]}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10 }}>
                      {blog.image_overridden && <span style={{ color: 'rgba(255,200,100,0.8)' }}>overridden</span>}
                      {blog.image_history?.length > 0 && <span style={{ color: S.blue }}>{blog.image_history.length} prev</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
