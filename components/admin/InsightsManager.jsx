'use client';

/**
 * InsightsManager — Admin component for managing Latest Insights cards on homepage.
 * Mobile-first design matching the SuperAdmin LUX theme.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminJSON } from '@/lib/auth/adminTokenClient';

const EMPTY_CARD = {
  title: '',
  kicker: '',
  postTitle: '',
  desc: '',
  href: '',
  img: '',
  kind: 'post',
  enabled: true,
};

const KINDS = [
  { value: 'post', label: 'Blog Post' },
  { value: 'tool', label: 'Tool' },
  { value: 'live-intel', label: 'Live Intelligence' },
];

export function InsightsManager() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [editingSlot, setEditingSlot] = useState(null); // 'editorial' | 'itr' | 'liveIntel' | index
  const [editForm, setEditForm] = useState({ ...EMPTY_CARD });

  const showNote = useCallback((msg, ms = 3000) => {
    setNote(msg);
    setTimeout(() => setNote(''), ms);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/insights');
      if (r.ok && j?.ok) {
        setConfig(j.config);
      } else {
        showNote('Failed to load config');
      }
    } catch {
      showNote('Network error');
    } finally {
      setLoading(false);
    }
  }, [showNote]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newConfig) => {
    setSaving(true);
    try {
      const { r, j } = await fetchAdminJSON('/api/admin/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (r.ok && j?.ok) {
        setConfig(newConfig);
        showNote('Saved ✅');
      } else {
        showNote('Save failed: ' + (j?.error || 'unknown'));
      }
    } catch {
      showNote('Network error');
    } finally {
      setSaving(false);
    }
  }, [showNote]);

  function startEdit(slot) {
    let card;
    if (slot === 'editorial') card = config?.editorial || EMPTY_CARD;
    else if (slot === 'itr') card = config?.itr || EMPTY_CARD;
    else if (slot === 'liveIntel') card = config?.liveIntel || EMPTY_CARD;
    else card = config?.custom?.[slot] || EMPTY_CARD;
    setEditForm({ ...EMPTY_CARD, ...card });
    setEditingSlot(slot);
  }

  function saveEdit() {
    const c = { ...config };
    if (editingSlot === 'editorial') c.editorial = { ...editForm };
    else if (editingSlot === 'itr') c.itr = { ...editForm };
    else if (editingSlot === 'liveIntel') c.liveIntel = { ...editForm };
    else {
      if (!c.custom) c.custom = [];
      c.custom[editingSlot] = { ...editForm };
    }
    setEditingSlot(null);
    save(c);
  }

  function addCustom() {
    const c = { ...config };
    if (!c.custom) c.custom = [];
    c.custom.push({ ...EMPTY_CARD, title: 'New Card', postTitle: 'New Insight' });
    save(c);
  }

  function removeCustom(idx) {
    const c = { ...config };
    c.custom = [...(c.custom || [])];
    c.custom.splice(idx, 1);
    save(c);
  }

  function toggleEnabled(slot) {
    const c = { ...config };
    if (typeof slot === 'number') {
      c.custom = [...(c.custom || [])];
      c.custom[slot] = { ...c.custom[slot], enabled: !c.custom[slot]?.enabled };
    } else {
      c[slot] = { ...c[slot], enabled: !c[slot]?.enabled };
    }
    save(c);
  }

  if (loading) {
    return <div className="sa-muted">Loading insights config…</div>;
  }

  const fixedSlots = [
    { key: 'editorial', label: 'Editorial (Slot 1)', data: config?.editorial },
    { key: 'itr', label: 'ITR Tool (Slot 5)', data: config?.itr },
    { key: 'liveIntel', label: 'Live Intelligence (Slot 6)', data: config?.liveIntel },
  ];

  return (
    <div>
      <div className="sa-panelHead" style={{ marginBottom: 16 }}>
        <div className="sa-panelTitle">LATEST INSIGHTS MANAGER</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="sa-miniBtn" onClick={load} disabled={loading}>Refresh</button>
          <button className="sa-miniBtn sa-miniBtnActive" onClick={addCustom} disabled={saving}>+ Add Card</button>
        </div>
      </div>

      {note && <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', marginBottom: 12, fontSize: 13 }}>{note}</div>}

      {/* Fixed slots */}
      <div style={{ display: 'grid', gap: 10 }}>
        {fixedSlots.map(({ key, label, data }) => (
          <div key={key} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div className="sa-rowTitle">{label}</div>
                <div className="sa-rowSub">{data?.postTitle || 'Not configured'}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className={`sa-miniBtn${data?.enabled !== false ? ' sa-miniBtnActive' : ''}`}
                  onClick={() => toggleEnabled(key)}
                  disabled={saving}
                >
                  {data?.enabled !== false ? '✅ On' : '❌ Off'}
                </button>
                <button className="sa-miniBtn" onClick={() => startEdit(key)}>Edit</button>
              </div>
            </div>
            {data?.img && (
              <div style={{ width: '100%', maxWidth: 280, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                <img src={data.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Community pillar slots (auto-fetched — info only) */}
      <div style={{ margin: '16px 0 8px', opacity: 0.6, fontSize: 12 }}>
        Slots 2–4 (Community Impact, Guest Columns, Developer Insight) are auto-populated from approved community posts.
      </div>

      {/* Custom slots */}
      {(config?.custom || []).length > 0 && (
        <>
          <div style={{ margin: '16px 0 8px', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sa-muted)' }}>
            CUSTOM CARDS
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {(config?.custom || []).map((card, idx) => (
              <div key={idx} className="sa-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div className="sa-rowTitle">Custom #{idx + 1}</div>
                    <div className="sa-rowSub">{card?.postTitle || 'Empty'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      className={`sa-miniBtn${card?.enabled !== false ? ' sa-miniBtnActive' : ''}`}
                      onClick={() => toggleEnabled(idx)}
                      disabled={saving}
                    >
                      {card?.enabled !== false ? '✅ On' : '❌ Off'}
                    </button>
                    <button className="sa-miniBtn" onClick={() => startEdit(idx)}>Edit</button>
                    <button className="sa-miniBtn" onClick={() => removeCustom(idx)} style={{ color: 'rgba(255,120,120,0.8)' }}>Delete</button>
                  </div>
                </div>
                {card?.img && (
                  <div style={{ width: '100%', maxWidth: 280, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                    <img src={card.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit modal (inline) */}
      {editingSlot != null && (
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
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Edit Card — {typeof editingSlot === 'number' ? `Custom #${editingSlot + 1}` : editingSlot}
            </div>

            {[
              { key: 'postTitle', label: 'Headline', placeholder: 'Card headline' },
              { key: 'kicker', label: 'Kicker', placeholder: 'e.g. BM Editorial, Tool, Live' },
              { key: 'desc', label: 'Description', placeholder: 'Short description', multiline: true },
              { key: 'href', label: 'Link URL', placeholder: '/blog/some-slug or /tools/...' },
              { key: 'img', label: 'Image URL', placeholder: 'https://... or /blog-images/...' },
            ].map(({ key, label, placeholder, multiline }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, color: 'var(--sa-muted)' }}>
                  {label}
                </label>
                {multiline ? (
                  <textarea
                    className="sa-loginInput"
                    style={{ width: '100%', minHeight: 70, resize: 'vertical' }}
                    value={editForm[key] || ''}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    placeholder={placeholder}
                  />
                ) : (
                  <input
                    className="sa-loginInput"
                    style={{ width: '100%' }}
                    value={editForm[key] || ''}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    placeholder={placeholder}
                  />
                )}
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4, color: 'var(--sa-muted)' }}>
                Card Type
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {KINDS.map((k) => (
                  <button
                    key={k.value}
                    className={`sa-pill${editForm.kind === k.value ? ' sa-tabActive' : ''}`}
                    onClick={() => setEditForm({ ...editForm, kind: k.value })}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {editForm.img && (
              <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', maxWidth: 320, aspectRatio: '16/9' }}>
                <img src={editForm.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="sa-btn" onClick={() => setEditingSlot(null)}>Cancel</button>
              <button className="sa-btn sa-btnAccent" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
