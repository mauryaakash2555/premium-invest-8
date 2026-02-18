'use client';
import { useState, useEffect } from 'react';

export default function AdminQueue() {
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [enhanced, setEnhanced] = useState('');
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [sponsoredBy, setSponsoredBy] = useState('');
  const [tagsToAdd, setTagsToAdd] = useState('');
  const [unsplashResults, setUnsplashResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/queue');
      const data = await res.json();
      setPending(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = (post) => {
    setSelected(post);
    setEnhanced(post.incident_description || post.article_content || '');
    setUnsplashQuery(post.visual_keywords || post.title.substring(0, 50));
    setSelectedImage('');
    setAffiliateLink('');
    setSponsoredBy('');
    setTagsToAdd('');
    setUnsplashResults([]);
  };

  const handleApprove = async () => {
    if (!selected) return;
    
    try {
      const res = await fetch(`/api/admin/approve/${selected._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_enhanced: enhanced,
          image_url: selectedImage,
          affiliate_link: affiliateLink || null,
          sponsored_by: sponsoredBy || null,
          tags_to_add: tagsToAdd ? tagsToAdd.split(',').map(t => t.trim()) : []
        })
      });
      
      if (res.ok) {
        alert('✅ Approved and Published!');
        fetchPending();
        setSelected(null);
      } else {
        const data = await res.json();
        alert(`❌ Approval failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('❌ Network error');
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    
    const reason = prompt('Rejection reason (will be emailed to author):');
    if (!reason) return;
    
    try {
      const res = await fetch(`/api/admin/reject/${selected._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (res.ok) {
        alert('✅ Rejected');
        fetchPending();
        setSelected(null);
      } else {
        const data = await res.json();
        alert(`❌ Rejection failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('❌ Network error');
    }
  };

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    
    try {
      const res = await fetch(`/api/blog-image?query=${encodeURIComponent(unsplashQuery)}&count=9`);
      const data = await res.json();
      
      if (data.images && data.images.length > 0) {
        setUnsplashResults(data.images);
      } else {
        alert('No images found. Try different keywords.');
      }
    } catch (error) {
      console.error('Unsplash search error:', error);
      alert('Failed to search images');
    }
  };

  const selectImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setUnsplashResults([]);
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        📥 Approval Queue ({pending.length} pending)
      </h1>

      {loading && (
        <div className="text-center text-gray-400 py-12">
          Loading submissions...
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT: Pending List */}
        <div className="space-y-4 max-h-screen overflow-y-auto">
          {pending.map(post => (
            <div
              key={post._id}
              onClick={() => handleSelectPost(post)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                selected?._id === post._id
                  ? 'bg-[--lux-accent]/20 border-2 border-[--lux-accent]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold flex-1">{post.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    post.type === 'impact' ? '' : 'bg-purple-900/50 text-purple-300'
                  }`}
                  style={post.type === 'impact' ? { background: 'color-mix(in oklab, oklch(0.72 0.12 240) 15%, transparent)', color: 'oklch(0.72 0.12 240)' } : undefined}
                >
                  {post.type}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mb-2">{post.author_name}</p>
              
              {post.location && (
                <p className="text-gray-500 text-xs">📍 {post.location}</p>
              )}
              
              <p className="text-gray-500 text-xs mt-2">
                Submitted: {new Date(post.submitted_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          
          {!loading && pending.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              ✅ No pending submissions
            </div>
          )}
        </div>

        {/* RIGHT: Editor */}
        {selected && (
          <div className="space-y-6 max-h-screen overflow-y-auto">
            {/* Original Content */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="text-[--lux-accent] font-bold mb-2">📄 ORIGINAL SUBMISSION:</h4>
              <div className="text-white whitespace-pre-wrap text-sm">
                {selected.incident_description || selected.article_content}
              </div>
              
              {selected.evidence && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[--lux-accent] font-semibold text-sm mb-1">Evidence provided:</p>
                  <p className="text-gray-300 text-sm">{selected.evidence}</p>
                </div>
              )}
              
              {selected.author_credentials && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[--lux-accent] font-semibold text-sm mb-1">Author Credentials:</p>
                  <p className="text-gray-300 text-sm">{selected.author_credentials}</p>
                </div>
              )}
              
              {selected.author_linkedin && (
                <div className="mt-2">
                  <a 
                    href={selected.author_linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: 'oklch(0.72 0.12 240)' }}
                  >
                    🔗 View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>

            {/* Enhanced Version Editor */}
            <div>
              <h4 className="font-bold mb-2" style={{ color: 'oklch(0.72 0.14 155)' }}>✨ YOUR ENHANCED VERSION:</h4>
              <textarea
                value={enhanced}
                onChange={(e) => setEnhanced(e.target.value)}
                rows={15}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white text-sm font-mono focus:outline-none"
                style={{ '--tw-ring-color': 'oklch(0.72 0.14 155)' }}
                placeholder="Add data, sources, context, impact analysis..."
              />
            </div>

            {/* Image Selection */}
            <div>
              <h4 className="font-bold mb-2" style={{ color: 'oklch(0.72 0.12 240)' }}>🖼️ IMAGE:</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  placeholder="Search keywords for Unsplash"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && searchUnsplash()}
                />
                <button
                  onClick={searchUnsplash}
                  className="px-4 py-2 text-white rounded"
                  style={{ backgroundColor: 'oklch(0.72 0.12 240)' }}
                >
                  Search
                </button>
              </div>
              
              {/* Unsplash Results Grid */}
              {unsplashResults.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {unsplashResults.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.thumb || img.url}
                      alt={`Option ${idx + 1}`}
                      className="w-full h-24 object-cover rounded cursor-pointer hover:ring-2 hover:ring-white/30"
                      onClick={() => selectImage(img.url)}
                    />
                  ))}
                </div>
              )}
              
              {selectedImage && (
                <div className="mb-2">
                  <img src={selectedImage} alt="Selected" className="w-full rounded-lg" />
                </div>
              )}
              
              <input
                type="url"
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
                placeholder="Or paste image URL directly"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded text-white text-sm mt-2"
              />
            </div>

            {/* Monetization Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Affiliate Link (Optional)</label>
                <input
                  type="url"
                  value={affiliateLink}
                  onChange={(e) => setAffiliateLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Sponsored By (Optional)</label>
                <input
                  type="text"
                  value={sponsoredBy}
                  onChange={(e) => setSponsoredBy(e.target.value)}
                  placeholder="Company Name"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                />
              </div>
            </div>

            {/* Tags to Add (for social sharing) */}
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tags to Add (Twitter handles, comma-separated)</label>
              <input
                type="text"
                value={tagsToAdd}
                onChange={(e) => setTagsToAdd(e.target.value)}
                placeholder="@MumbaiPolice, @CMOMaharashtra"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleApprove}
                className="flex-1 py-3 text-white font-bold rounded-lg"
                style={{ backgroundColor: 'oklch(0.72 0.14 155)' }}
              >
                ✅ Approve & Publish
              </button>
              
              <button
                onClick={handleReject}
                className="flex-1 py-3 text-white font-bold rounded-lg"
                style={{ backgroundColor: 'oklch(0.65 0.18 25)' }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
