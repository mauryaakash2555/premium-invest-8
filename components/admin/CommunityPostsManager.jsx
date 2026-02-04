'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

/**
 * Community Posts Image Manager
 * 
 * Admin panel for managing images on Community Impact, Guest Columns, and Developer Insight posts
 * 
 * Features:
 * - View all community posts and their images
 * - Search for new images by keyword
 * - Rotate through fallback images
 * - Auto-generate images for posts without them
 */
export function CommunityPostsManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Load all community posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community-images', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Search for images
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchKeyword.trim()) return;
    
    setSearching(true);
    try {
      const res = await fetch('/api/community-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', keyword: searchKeyword })
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.images || []);
      } else {
        setSearchResults([]);
        setError(data.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  // Update a post's image
  const handleUpdateImage = async (postId, imageUrl) => {
    setActionLoading(postId);
    try {
      const res = await fetch('/api/community-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          postId, 
          imageUrl,
          keywords: searchKeyword ? [searchKeyword] : []
        })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh posts list
        await loadPosts();
        setSelectedPost(null);
        setSearchResults([]);
        setSearchKeyword('');
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Rotate to next fallback image
  const handleRotate = async (postId) => {
    setActionLoading(postId);
    try {
      const res = await fetch('/api/community-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate', postId })
      });
      const data = await res.json();
      if (data.success) {
        await loadPosts();
      } else {
        setError(data.error || 'Rotate failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Batch generate images
  const handleBatchGenerate = async (dryRun = false) => {
    setActionLoading('batch');
    try {
      const res = await fetch('/api/community-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch', dryRun, limit: 20 })
      });
      const data = await res.json();
      if (data.success) {
        if (!dryRun) {
          await loadPosts();
        }
        alert(`Batch ${dryRun ? 'preview' : 'update'}: ${data.updated} posts ${dryRun ? 'would be' : 'were'} updated`);
      } else {
        setError(data.error || 'Batch operation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pillarColors = {
    IMPACT: '#10B981',
    GUEST: '#3B82F6',
    DEV: '#8B5CF6',
    EDITORIAL: 'var(--lux-accent)'
  };

  if (loading) {
    return (
      <div className="sa-panel">
        <div className="sa-panelHead">
          <div className="sa-panelTitle">COMMUNITY POSTS IMAGES</div>
        </div>
        <div className="sa-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="sa-panel">
      <div className="sa-panelHead">
        <div className="sa-panelTitle">COMMUNITY POSTS IMAGES</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className="sa-miniBtn" 
            onClick={() => handleBatchGenerate(true)}
            disabled={actionLoading === 'batch'}
          >
            Preview Auto-Fill
          </button>
          <button 
            className="sa-miniBtn" 
            onClick={() => handleBatchGenerate(false)}
            disabled={actionLoading === 'batch'}
            style={{ background: 'rgba(16, 185, 129, 0.2)' }}
          >
            Auto-Fill All
          </button>
          <button className="sa-miniBtn" onClick={loadPosts}>Refresh</button>
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '4px',
          marginBottom: '16px',
          color: '#EF4444'
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: 12, opacity: 0.7, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Image Search Section */}
      {selectedPost && (
        <div style={{ 
          padding: '16px', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <div>
              <strong>Selecting image for:</strong>
              <span style={{ 
                marginLeft: 8, 
                color: pillarColors[selectedPost.pillar] || '#888'
              }}>
                {selectedPost.title?.slice(0, 60)}...
              </span>
            </div>
            <button 
              className="sa-miniBtn" 
              onClick={() => { setSelectedPost(null); setSearchResults([]); }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: '16px' }}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search images... (e.g., 'Mumbai traffic', 'GST tax', 'AI coding')"
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <button 
              type="submit" 
              className="sa-btn"
              disabled={searching || !searchKeyword.trim()}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Results Grid */}
          {searchResults.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px'
            }}>
              {searchResults.map((img) => (
                <div 
                  key={img.id}
                  onClick={() => handleUpdateImage(selectedPost._id, img.url)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '2px solid transparent',
                    transition: 'all 0.2s',
                    opacity: actionLoading === selectedPost._id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--lux-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <img 
                    src={img.thumbnail} 
                    alt={img.description || 'Search result'}
                    style={{ 
                      width: '100%', 
                      height: '100px', 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{ 
                    padding: '6px', 
                    fontSize: '10px', 
                    color: '#888',
                    background: 'rgba(0,0,0,0.6)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    📷 {img.photographer || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchKeyword && !searching && (
            <div className="sa-muted">No images found. Try different keywords.</div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {posts.map((post) => (
          <div 
            key={post._id}
            style={{
              display: 'flex',
              gap: '16px',
              padding: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px',
              alignItems: 'center'
            }}
          >
            {/* Image Preview */}
            <div style={{
              width: '120px',
              height: '75px',
              borderRadius: '4px',
              overflow: 'hidden',
              flexShrink: 0,
              background: post.image_url 
                ? `url(${post.image_url}) center/cover`
                : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
            }}>
              {!post.image_url && (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '12px'
                }}>
                  No Image
                </div>
              )}
            </div>

            {/* Post Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{
                  padding: '2px 8px',
                  background: `${pillarColors[post.pillar]}22`,
                  color: pillarColors[post.pillar],
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {post.pillar}
                </span>
                {post.image_source && (
                  <span style={{ fontSize: '10px', color: '#666' }}>
                    ({post.image_source})
                  </span>
                )}
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#ddd',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {post.title}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                {post.author}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button 
                className="sa-miniBtn"
                onClick={() => handleRotate(post._id)}
                disabled={actionLoading === post._id}
                title="Cycle to next fallback image"
              >
                🔄 Rotate
              </button>
              <button 
                className="sa-miniBtn"
                onClick={() => {
                  setSelectedPost(post);
                  setSearchResults([]);
                  // Pre-fill search with keywords from title
                  const titleWords = (post.title || '').replace(/[""'"]/g, '').split(' ').slice(0, 3).join(' ');
                  setSearchKeyword(titleWords);
                }}
                disabled={actionLoading === post._id}
                style={{ background: 'rgba(212, 165, 116, 0.15)' }}
              >
                🔍 Search
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="sa-muted">No community posts found.</div>
      )}
    </div>
  );
}
