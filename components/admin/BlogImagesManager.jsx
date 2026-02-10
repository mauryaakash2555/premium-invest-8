'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

/**
 * Universal Blog Images Manager
 * 
 * Manages images for ALL blog types:
 * - BM Editorial
 * - Community Impact
 * - Guest Columns
 * - Developer Insight
 * 
 * Features:
 * - Filter by pillar
 * - Search Unsplash for images
 * - Update blog images
 * - View and revert to previous images
 */
export function BlogImagesManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePillar, setActivePillar] = useState('all');
  const [pillars, setPillars] = useState({});
  
  // Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Selected blog for editing
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const [actionLoading, setActionLoading] = useState(null);

  const pillarLabels = {
    all: 'All Blogs',
    editorial: 'BM Editorial',
    impact: 'Community Impact',
    guest: 'Guest Columns',
    dev: 'Developer Insight'
  };

  // Load blogs
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

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Search for images
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchKeyword.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/blog-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', keyword: searchKeyword, perPage: 12 })
      });
      if (r.ok && j?.success) {
        setSearchResults(j.images || []);
      } else {
        setSearchResults([]);
        setError(j?.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  // Update blog image
  const handleUpdateImage = async (imageUrl) => {
    if (!selectedBlog) return;
    
    setActionLoading(selectedBlog.id);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/blog-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          blogId: selectedBlog.id,
          pillar: selectedBlog.pillar,
          imageUrl,
          currentImage: selectedBlog.image_url
        })
      });
      
      if (r.ok && j?.success) {
        await loadBlogs();
        setSelectedBlog(null);
        setSearchResults([]);
        setSearchKeyword('');
      } else {
        setError(j?.error || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Revert to previous image
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
          imageUrl
        })
      });
      
      if (r.ok && j?.success) {
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

  const filteredBlogs = activePillar === 'all' 
    ? blogs 
    : blogs.filter(b => b.pillar === activePillar);

  return (
    <div className="sa-panel">
      <div className="sa-panelHead">
        <div className="sa-panelTitle">BLOG IMAGES MANAGER</div>
        <button className="sa-miniBtn" onClick={loadBlogs} disabled={loading}>
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(255,100,100,0.1)', 
          border: '1px solid rgba(255,100,100,0.3)',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'rgba(255,200,200,0.9)'
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: '12px', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Pillar Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '20px', 
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '12px'
      }}>
        {Object.entries(pillarLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActivePillar(key)}
            style={{
              padding: '8px 16px',
              background: activePillar === key ? 'rgba(170,198,255,0.15)' : 'transparent',
              border: activePillar === key ? '1px solid rgba(170,198,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
              color: activePillar === key ? 'rgba(170,198,255,1)' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {label} {pillars[key] !== undefined ? `(${pillars[key]})` : ''}
          </button>
        ))}
      </div>

      {/* Selected Blog Editor */}
      {selectedBlog && (
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(170,198,255,0.3)',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--lux-accent)' }}>{selectedBlog.title}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>
                {pillarLabels[selectedBlog.pillar]} · {selectedBlog.author}
              </p>
            </div>
            <button 
              onClick={() => { setSelectedBlog(null); setSearchResults([]); setShowHistory(false); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>

          {/* Current Image */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Current Image:</div>
            {selectedBlog.image_url ? (
              <img 
                src={selectedBlog.image_url} 
                alt={selectedBlog.title}
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            ) : (
              <div style={{ padding: '40px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', opacity: 0.5 }}>
                No image set
              </div>
            )}
          </div>

          {/* History Toggle */}
          {selectedBlog.image_history?.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: '8px 16px',
                background: showHistory ? 'rgba(170,198,255,0.15)' : 'transparent',
                border: '1px solid rgba(170,198,255,0.3)',
                color: 'rgba(170,198,255,0.9)',
                cursor: 'pointer',
                fontSize: '13px',
                marginBottom: '16px'
              }}
            >
              {showHistory ? 'Hide History' : `View Previous Images (${selectedBlog.image_history.length})`}
            </button>
          )}

          {/* Image History */}
          {showHistory && selectedBlog.image_history?.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Previous Images (click to revert):</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedBlog.image_history.map((h, i) => (
                  <div 
                    key={i}
                    onClick={() => handleRevert(h.url)}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      transition: 'border-color 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(170,198,255,0.6)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <img 
                      src={h.url} 
                      alt={`Previous ${i + 1}`}
                      style={{ width: '120px', height: '80px', objectFit: 'cover' }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      background: 'rgba(0,0,0,0.7)', 
                      padding: '2px 4px',
                      fontSize: '10px',
                      textAlign: 'center'
                    }}>
                      {new Date(h.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search for new image */}
          <div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Search for new image:</div>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Enter keyword (e.g., finance, investment, money)"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'inherit',
                  fontSize: '13px'
                }}
              />
              <button
                type="submit"
                disabled={searching || !searchKeyword.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(170,198,255,0.15)',
                  border: '1px solid rgba(170,198,255,0.4)',
                  color: 'rgba(170,198,255,1)',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {searchResults.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => handleUpdateImage(img.url)}
                    style={{
                      cursor: actionLoading ? 'wait' : 'pointer',
                      border: '2px solid transparent',
                      transition: 'all 0.2s',
                      position: 'relative',
                      opacity: actionLoading ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.borderColor = 'rgba(170,198,255,0.6)'; }}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <img
                      src={img.thumb}
                      alt={img.alt}
                      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    />
                    {img.photographer && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.7)',
                        padding: '2px 4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        📷 {img.photographer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blog List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>Loading blogs...</div>
      ) : filteredBlogs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.6 }}>No blogs found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => { setSelectedBlog(blog); setShowHistory(false); setSearchResults([]); }}
              style={{
                background: selectedBlog?.id === blog.id ? 'rgba(170,198,255,0.1)' : 'rgba(0,0,0,0.2)',
                border: selectedBlog?.id === blog.id ? '1px solid rgba(170,198,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                {/* Thumbnail */}
                <div style={{ flexShrink: 0 }}>
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '60px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      opacity: 0.3
                    }}>
                      🖼️
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {blog.title}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>
                    {pillarLabels[blog.pillar]}
                  </div>
                  {blog.image_history?.length > 0 && (
                    <div style={{ fontSize: '10px', color: 'rgba(170,198,255,0.8)', marginTop: '4px' }}>
                      {blog.image_history.length} previous image{blog.image_history.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
