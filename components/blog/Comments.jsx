'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

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

export default function Comments({ postId, postSlug, postTitle, contextTitle, contextSubtitle, whatsappHref }) {
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
  const [activeReplyTo, setActiveReplyTo] = useState(null); // { id, name }
  const [replyDraft, setReplyDraft] = useState('');
  const [likesById, setLikesById] = useState({}); // id -> true

  const identifier = postId || postSlug;

  const headerTitle = useMemo(() => {
    const raw = String(contextTitle || '').trim();
    if (raw) return raw;
    // Lightweight “Quora-like” contextualization without requiring per-post config.
    if (/\bAI\b|artificial\s+intelligence|LLM|GPT/i.test(String(postTitle || ''))) {
      return "Developers: What’s your 2026 AI experience?";
    }
    return 'Join the Discussion';
  }, [contextTitle, postTitle]);

  const headerSubtitle = useMemo(() => {
    const raw = String(contextSubtitle || '').trim();
    if (raw) return raw;
    return 'Share your experience or ask questions. Community-powered insights.';
  }, [contextSubtitle]);

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

  const submitComment = async ({ text, replyToId }) => {
    if (!identifier || submitting) return false;

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const outgoing = {
        ...formData,
        comment_text: replyToId ? `[[reply_to:${replyToId}]]\n${text}` : text,
      };

      const res = await fetch(`/api/comments/${encodeURIComponent(identifier)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outgoing),
      });

      if (!res.ok) {
        setSubmitStatus('error');
        return false;
      }

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

      // Keep identity fields so returning commenters feel like regulars.
      setFormData((prev) => ({ ...prev, comment_text: '' }));
      setSubmitStatus('success');
      fetchComments();
      setTimeout(() => setSubmitStatus(null), 3000);
      return true;
    } catch (error) {
      console.error('Comment submission failed:', error);
      setSubmitStatus('error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitComment({ text: formData.comment_text, replyToId: '' });
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

  const approvedComments = (Array.isArray(comments) ? comments : []).filter(
    (c) => String(c?.status || '').toLowerCase() === 'approved'
  );

  const normalized = approvedComments.map((c) => {
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

  const totalCount = normalized.length;

  const countText = loading
    ? 'Loading comments…'
    : `${totalCount} comment${totalCount === 1 ? '' : 's'}${totalCount === 0 ? ' — Start the conversation' : ' — Join the discussion'}`;

  const scrollToForm = () => {
    try {
      document.getElementById('bm-comment-form')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-12 mb-12 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-white/10">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          {headerTitle}
        </h2>
        <p className="text-gray-500 text-sm">{countText}</p>
      </div>

      {/* Comments List — Quora-style compact thread */}
      <div className="space-y-1 mb-8">
        {loading ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 text-white/50 text-sm">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
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
                className="py-4 border-b border-white/[0.06]"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-black text-xs font-bold"
                    style={{ background: 'var(--lux-accent)' }}
                  >
                    {author[0]?.toUpperCase?.() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-white text-sm font-semibold">{author}</span>
                      <span className="text-[11px] text-gray-500">{when}</span>
                      {comment.__highlighted ? (
                        <span className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/50 rounded">Pinned</span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-gray-300 text-[14px] leading-relaxed whitespace-pre-wrap">
                      {comment.__text}
                    </p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                      <button
                        type="button"
                        onClick={() => toggleLike(comment.__id)}
                        className={`hover:text-white transition-colors ${liked ? 'text-white/80' : ''}`}
                        aria-pressed={liked}
                      >
                        ▲ {helpful}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyTo({ id: comment.__id, name: author });
                          setReplyDraft('');
                        }}
                        className="hover:text-white transition-colors"
                      >
                        Reply
                      </button>
                    </div>

                    {activeReplyTo?.id === comment.__id ? (
                      <div className="mt-3 pl-0">
                        {!String(formData.author_name || '').trim() || !String(formData.author_email || '').trim() ? (
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={formData.author_name}
                              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                              className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 focus:outline-none"
                            />
                            <input
                              type="email"
                              placeholder="Email (private)"
                              value={formData.author_email}
                              onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                              className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 focus:outline-none"
                            />
                          </div>
                        ) : null}
                        <div className="flex gap-2 items-end">
                          <textarea
                            className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 focus:outline-none resize-none"
                            rows={2}
                            placeholder={`Reply to ${author}…`}
                            value={replyDraft}
                            onChange={(e) => setReplyDraft(e.target.value)}
                          />
                          <button
                            type="button"
                            disabled={
                              submitting ||
                              !String(replyDraft || '').trim() ||
                              !String(formData.author_name || '').trim() ||
                              !String(formData.author_email || '').trim()
                            }
                            onClick={async () => {
                              const ok = await submitComment({ text: replyDraft, replyToId: comment.__id });
                              if (ok) {
                                setActiveReplyTo(null);
                                setReplyDraft('');
                              }
                            }}
                            className="px-3 py-1.5 rounded text-xs font-bold text-black disabled:opacity-40"
                            style={{ backgroundColor: 'var(--lux-accent)' }}
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActiveReplyTo(null); setReplyDraft(''); }}
                            className="text-xs text-white/40 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {replies.length > 0 ? (
                      <div className="mt-3 space-y-0.5 ml-2 border-l border-white/[0.06] pl-3">
                        {replies.map((r) => {
                          const rAuthor = String(r?.author_name || 'Anonymous');
                          const rWhen = relativeTime(r?.created_at) || formatDate(r?.created_at);
                          return (
                            <div key={r.__id} className="py-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-white/80 text-sm font-semibold">{rAuthor}</span>
                                <span className="text-[11px] text-gray-500">{rWhen}</span>
                              </div>
                              <p className="mt-0.5 text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap">
                                {r.__text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4">
            <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts.</p>
          </div>
        )}
      </div>

      {/* Comment Form — compact inline */}
      <form id="bm-comment-form" onSubmit={handleSubmit} className="mb-8 pt-4 border-t border-white/[0.06]">
        <div className="flex items-start gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-black text-xs font-bold mt-0.5"
            style={{ background: 'var(--lux-accent)' }}
          >
            {String(formData.author_name || '')[0]?.toUpperCase?.() || '?'}
          </div>
          <div className="flex-1 space-y-2">
            {!String(formData.author_name || '').trim() || !String(formData.author_email || '').trim() ? (
              <div className="flex gap-2">
                <input
                  id="author_name"
                  type="text"
                  placeholder="Name"
                  required
                  value={formData.author_name}
                  onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                  className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 focus:outline-none"
                />
                <input
                  id="author_email"
                  type="email"
                  placeholder="Email (private)"
                  required
                  value={formData.author_email}
                  onChange={(e) => setFormData({...formData, author_email: e.target.value})}
                  className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 focus:outline-none"
                />
              </div>
            ) : null}
            <textarea
              id="comment_text"
              placeholder="Write a comment…"
              required
              rows={2}
              value={formData.comment_text}
              onChange={(e) => setFormData({...formData, comment_text: e.target.value})}
              className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-white text-sm placeholder:text-white/30 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded text-xs font-bold text-black disabled:opacity-40"
                  style={{ backgroundColor: 'var(--lux-accent)' }}
                >
                  {submitting ? 'Posting…' : 'Comment'}
                </button>
                <label className="inline-flex items-center gap-1.5 text-[11px] text-white/30 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => {
                      const next = Boolean(e.target.checked);
                      setRememberMe(next);
                      if (!next) {
                        try { localStorage.removeItem(LS_NAME); localStorage.removeItem(LS_EMAIL); } catch {}
                        clearCookie('bm_comment_name');
                        clearCookie('bm_comment_email');
                      }
                    }}
                    style={{ accentColor: 'var(--lux-accent)', width: 12, height: 12 }}
                  />
                  Remember me
                </label>
              </div>
              {submitStatus === 'success' && (
                <span className="text-emerald-400 text-xs">Submitted for review.</span>
              )}
              {submitStatus === 'error' && (
                <span className="text-red-400 text-xs">Failed. Try again.</span>
              )}
            </div>
          </div>
        </div>
      </form>

      <p className="text-[11px] text-gray-600 text-center">Comments are moderated. No login required.</p>
    </div>
  );
}
