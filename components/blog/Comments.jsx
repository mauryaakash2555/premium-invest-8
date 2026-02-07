'use client';

import { useState, useEffect, useCallback } from 'react';

const LS_NAME = 'bm_comment_name';
const LS_EMAIL = 'bm_comment_email';
const LS_LIKES = 'bm_comment_likes_v1';

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function stripMarkers(raw) {
  const text = String(raw || '');
  const highlight = /^\s*\[\[highlight\]\]\s*/i.test(text);
  const withoutHighlight = text.replace(/^\s*\[\[highlight\]\]\s*/i, '');
  const replyMatch = withoutHighlight.match(/^\s*\[\[reply_to:([^\]]+)\]\]\s*\n?/i);
  const replyToId = replyMatch ? String(replyMatch[1] || '').trim() : '';
  const withoutReply = withoutHighlight.replace(/^\s*\[\[reply_to:[^\]]+\]\]\s*\n?/i, '');
  return { text: withoutReply.trim(), replyToId, highlighted: highlight };
}

function relativeTime(dateStr) {
  try {
    const t = new Date(dateStr).getTime();
    if (!Number.isFinite(t)) return '';
    const diffMs = Date.now() - t;
    const s = Math.floor(diffMs / 1000);
    if (s < 45) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

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
  const [replyTo, setReplyTo] = useState(null); // { id, name }
  const [likesById, setLikesById] = useState({}); // id -> true

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
    // Prefill from localStorage (primary) and cookie (fallback).
    let savedName = '';
    let savedEmail = '';
    try {
      savedName = String(localStorage.getItem(LS_NAME) || '').trim();
      savedEmail = String(localStorage.getItem(LS_EMAIL) || '').trim();
    } catch {
      // ignore
    }

    if (!savedName) savedName = getCookie('bm_comment_name');
    if (!savedEmail) savedEmail = getCookie('bm_comment_email');

    const hasSaved = Boolean(savedName || savedEmail);
    setRememberMe(hasSaved);

    if (savedName || savedEmail) {
      setFormData((prev) => ({
        ...prev,
        author_name: prev.author_name || savedName || '',
        author_email: prev.author_email || savedEmail || '',
      }));
    }

    // Load likes (per-device)
    try {
      const raw = localStorage.getItem(LS_LIKES);
      const parsed = safeJsonParse(raw || '{}', {});
      if (parsed && typeof parsed === 'object') setLikesById(parsed);
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || submitting) return;
    
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const outgoing = {
        ...formData,
        comment_text: replyTo?.id
          ? `[[reply_to:${replyTo.id}]]\n${formData.comment_text}`
          : formData.comment_text,
      };
      const res = await fetch(`/api/comments/${encodeURIComponent(identifier)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outgoing)
      });

      if (res.ok) {
        if (rememberMe) {
          try {
            localStorage.setItem(LS_NAME, formData.author_name || '');
            localStorage.setItem(LS_EMAIL, formData.author_email || '');
          } catch {
            // ignore
          }
          setCookie('bm_comment_name', formData.author_name || '');
          setCookie('bm_comment_email', formData.author_email || '');
        } else {
          try {
            localStorage.removeItem(LS_NAME);
            localStorage.removeItem(LS_EMAIL);
          } catch {
            // ignore
          }
          clearCookie('bm_comment_name');
          clearCookie('bm_comment_email');
        }
        setFormData({ author_name: '', author_email: '', comment_text: '' });
        setReplyTo(null);
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

  const toggleLike = (commentId) => {
    const id = String(commentId || '').trim();
    if (!id) return;
    setLikesById((prev) => {
      const next = { ...(prev || {}) };
      if (next[id]) delete next[id];
      else next[id] = true;
      try {
        localStorage.setItem(LS_LIKES, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const normalized = (Array.isArray(comments) ? comments : []).map((c) => {
    const id = c?.id ?? c?._id;
    const stableId = String(id || '').trim() || String(c?.created_at || '') || '';
    const parsed = stripMarkers(c?.comment_text);
    return {
      ...c,
      __id: stableId,
      __text: parsed.text,
      __replyToId: parsed.replyToId,
      __highlighted: parsed.highlighted || Boolean(c?.highlighted),
    };
  });

  const repliesByParent = normalized.reduce((acc, c) => {
    const parent = String(c.__replyToId || '').trim();
    if (!parent) return acc;
    acc[parent] = acc[parent] || [];
    acc[parent].push(c);
    return acc;
  }, {});

  const topLevel = normalized.filter((c) => !String(c.__replyToId || '').trim());

  const countText = loading
    ? 'Loading comments…'
    : `${topLevel.length} comment${topLevel.length === 1 ? '' : 's'}${topLevel.length === 0 ? ' — Start the conversation' : ' — Join the discussion'}`;

  return (
    <div className="mt-16 mb-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span>💬</span>
          <span>Join the Discussion</span>
        </h2>
        <p className="text-gray-400">{countText}</p>
        <p className="text-gray-500 text-sm mt-2">Share your experience or ask questions. Community-powered insights.</p>
      </div>

      {/* Comments List */}
      <div className="space-y-6 mb-10">
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
        ) : topLevel.length > 0 ? (
          topLevel.map((comment) => {
            const baseHelpful = Number(comment?.likes_count ?? comment?.helpful_count ?? 0) || 0;
            const liked = Boolean(likesById?.[comment.__id]);
            const helpful = baseHelpful + (liked ? 1 : 0);
            const replies = Array.isArray(repliesByParent?.[comment.__id]) ? repliesByParent[comment.__id] : [];
            const author = String(comment?.author_name || 'Anonymous');
            const when = relativeTime(comment?.created_at) || formatDate(comment?.created_at);

            return (
              <div
                key={comment.__id}
                className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[oklch(0.78_0.08_65)] to-[oklch(0.65_0.08_65)] flex items-center justify-center text-black font-bold">
                      {author[0]?.toUpperCase?.() || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{author}</p>
                        {comment.__highlighted ? (
                          <span className="text-[11px] px-2 py-0.5 border border-white/10 bg-white/5 text-white/70 rounded-full">
                            Highlighted by BM Wealth
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500">{when}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {comment.__text}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo({ id: comment.__id, name: author });
                      try {
                        document.getElementById('bm-comment-form')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
                      } catch {}
                    }}
                    className="hover:text-white transition-colors"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLike(comment.__id)}
                    className="hover:text-white transition-colors"
                    aria-pressed={liked}
                  >
                    ▲ {helpful} Helpful
                  </button>
                </div>

                {replies.length > 0 ? (
                  <div className="mt-5 space-y-3 border-l border-white/10 pl-4">
                    {replies.map((r) => {
                      const rAuthor = String(r?.author_name || 'Anonymous');
                      const rWhen = relativeTime(r?.created_at) || formatDate(r?.created_at);
                      return (
                        <div key={r.__id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                          <div className="flex items-center justify-between">
                            <p className="text-white/90 text-sm font-semibold">{rAuthor}</p>
                            <p className="text-xs text-gray-500">{rWhen}</p>
                          </div>
                          <p className="mt-2 text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                            {r.__text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 px-4">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-400 text-lg mb-2">Start the conversation</p>
            <p className="text-gray-500 text-sm">Ask a question or share your experience.</p>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <form id="bm-comment-form" onSubmit={handleSubmit} className="mb-12 p-6 bg-white/5 border border-white/10 rounded-xl">
        <div className="space-y-4">
          {replyTo?.id ? (
            <div className="flex items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-sm text-white/70">
                Replying to <span className="text-white font-semibold">{replyTo?.name || 'comment'}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : null}

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
                    try {
                      localStorage.removeItem(LS_NAME);
                      localStorage.removeItem(LS_EMAIL);
                    } catch {
                      // ignore
                    }
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
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              ) : 'Post Comment & Join the Conversation'}
            </button>

            <span className="text-xs text-white/50">
              No login required. Your email stays private.
            </span>

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

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          💡 Comments are moderated. Please keep discussions respectful and on-topic.
        </p>
      </div>
    </div>
  );
}
