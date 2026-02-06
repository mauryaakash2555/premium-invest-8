'use client';

import { useState, useEffect, useCallback } from 'react';

function getCookie(name) {
  try {
    const key = `${encodeURIComponent(name)}=`;
    const parts = String(document.cookie || '').split(';').map((p) => p.trim());
    const hit = parts.find((p) => p.startsWith(key));
    if (!hit) return '';
    return decodeURIComponent(hit.slice(key.length));
  } catch {
    return '';
  }
}

function setCookie(name, value, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || '')}; Expires=${expires}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function clearCookie(name) {
  try {
    document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export default function Comments({ postId, postSlug }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    comment_text: ''
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const identifier = postId || postSlug;

  const fetchComments = useCallback(async () => {
    if (!identifier) return;
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(identifier)}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : Array.isArray(data?.comments) ? data.comments : [];
        setComments(items);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    // Prefill once per session (cookie-based remembrance).
    const savedName = getCookie('bm_comment_name');
    const savedEmail = getCookie('bm_comment_email');
    const hasSaved = Boolean(savedName || savedEmail);
    setRememberMe(hasSaved ? true : true);

    if (savedName || savedEmail) {
      setFormData((prev) => ({
        ...prev,
        author_name: prev.author_name || savedName || '',
        author_email: prev.author_email || savedEmail || '',
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || submitting) return;
    
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(identifier)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        if (rememberMe) {
          setCookie('bm_comment_name', formData.author_name || '');
          setCookie('bm_comment_email', formData.author_email || '');
        } else {
          clearCookie('bm_comment_name');
          clearCookie('bm_comment_email');
        }
        setFormData({ author_name: '', author_email: '', comment_text: '' });
        setSubmitStatus('success');
        fetchComments();
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Comment submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mt-16 mb-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span>💬</span>
          <span>Join the Discussion</span>
          {!loading && comments.length > 0 ? (
            <span className="text-base font-normal text-white/60">({comments.length})</span>
          ) : null}
        </h2>
        <p className="text-gray-400">
          Share your experience or ask questions. Community-powered insights.
        </p>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12 p-6 bg-white/5 border border-white/10 rounded-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author_name" className="block text-sm text-white/70 mb-1">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                id="author_name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[oklch(0.78_0.08_65)] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="author_email" className="block text-sm text-white/70 mb-1">
                Email <span className="text-white/40">(not shown publicly)</span> <span className="text-red-400">*</span>
              </label>
              <input
                id="author_email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.author_email}
                onChange={(e) => setFormData({...formData, author_email: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[oklch(0.78_0.08_65)] transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="comment_text" className="block text-sm text-white/70 mb-1">
              Your Comment <span className="text-red-400">*</span>
            </label>
            <textarea
              id="comment_text"
              placeholder="Share your thoughts, experiences, or questions..."
              required
              rows={4}
              value={formData.comment_text}
              onChange={(e) => setFormData({...formData, comment_text: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[oklch(0.78_0.08_65)] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-white/60 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const next = Boolean(e.target.checked);
                  setRememberMe(next);
                  if (!next) {
                    clearCookie('bm_comment_name');
                    clearCookie('bm_comment_email');
                  }
                }}
                className="accent-[oklch(0.78_0.08_65)]"
              />
              Remember my name & email on this device
            </label>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-bold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ backgroundColor: 'oklch(0.78 0.08 65)' }}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Posting...
                </span>
              ) : 'Post Comment'}
            </button>

            {submitStatus === 'success' && (
              <span className="text-emerald-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Comment posted successfully!
              </span>
            )}
            {submitStatus === 'error' && (
              <span className="text-red-400 text-sm">
                Failed to post comment. Please try again.
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-white/50">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading comments...
            </div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment, idx) => (
            <div 
              key={comment._id || idx} 
              className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.78_0.08_65)] to-[oklch(0.65_0.08_65)] flex items-center justify-center text-black font-bold">
                    {(comment.author_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{comment.author_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed pl-13">
                {comment.comment_text}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-400 text-lg mb-2">Start the conversation</p>
            <p className="text-gray-500 text-sm">Ask a question or share your experience.</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          💡 Comments are moderated. Please keep discussions respectful and on-topic.
        </p>
      </div>
    </div>
  );
}
