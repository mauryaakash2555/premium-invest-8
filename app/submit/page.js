'use client';

import { useMemo, useState } from 'react';

const inputStyle = {
  width: '100%',
  padding: '14px 14px',
  borderRadius: 0,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
  color: 'rgba(235, 242, 255, 0.92)',
  outline: 'none',
};

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: '',
    content_original: '',
    type: 'impact',
    author_name: '',
    author_email: '',
    author_linkedin: '',
    location_tag: '',
    visual_seed: '',
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    return (
      String(form.title || '').trim().length >= 6 &&
      String(form.content_original || '').trim().length >= 50 &&
      String(form.author_name || '').trim().length >= 2 &&
      ['impact', 'guest'].includes(String(form.type || '').toLowerCase())
    );
  }, [form]);

  const onChange = (key) => (e) => {
    setForm((s) => ({ ...s, [key]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/submit-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: String(form.type || '').toLowerCase(),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || (json && json.success === false)) {
        setStatus('error');
        setError((json && json.detail) || 'Submission failed');
        return;
      }

      setStatus('success');
      setForm({
        title: '',
        content_original: '',
        type: 'impact',
        author_name: '',
        author_email: '',
        author_linkedin: '',
        location_tag: '',
        visual_seed: '',
      });
    } catch {
      setStatus('error');
      setError('Submission failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000' }}>
      <section
        className="section-container"
        style={{
          paddingTop: '120px',
          paddingBottom: '60px',
          maxWidth: '900px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            marginBottom: '12px',
            fontWeight: 300,
            letterSpacing: '2px',
            fontFamily: '"Playfair Display", serif',
            color: 'var(--lux-accent)',
          }}
        >
          Submit Your Story
        </h1>
        <p style={{ color: 'rgba(235,242,255,0.86)', marginBottom: '26px', lineHeight: 1.7 }}>
          Share a thoughtful community-impact story or guest column. Dev will review and publish the best submissions.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label style={{ color: '#9ca3af', fontSize: '13px' }}>Pillar</label>
            <select value={form.type} onChange={onChange('type')} style={inputStyle}>
              <option value="impact">Community Impact</option>
              <option value="guest">Guest Columns</option>
            </select>
          </div>

          <div>
            <label style={{ color: '#9ca3af', fontSize: '13px' }}>Title</label>
            <input value={form.title} onChange={onChange('title')} style={inputStyle} placeholder="A clear, specific headline" />
          </div>

          <div>
            <label style={{ color: '#9ca3af', fontSize: '13px' }}>Your Name</label>
            <input value={form.author_name} onChange={onChange('author_name')} style={inputStyle} placeholder="Name" />
          </div>

          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '13px' }}>Email (optional)</label>
              <input value={form.author_email} onChange={onChange('author_email')} style={inputStyle} placeholder="email@domain.com" />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '13px' }}>LinkedIn (optional)</label>
              <input value={form.author_linkedin} onChange={onChange('author_linkedin')} style={inputStyle} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '13px' }}>Location (optional)</label>
              <input value={form.location_tag} onChange={onChange('location_tag')} style={inputStyle} placeholder="Mumbai, Maharashtra" />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: '13px' }}>Visual Seed (optional)</label>
              <input value={form.visual_seed} onChange={onChange('visual_seed')} style={inputStyle} placeholder="keywords for hero image" />
            </div>
          </div>

          <div>
            <label style={{ color: '#9ca3af', fontSize: '13px' }}>Story / Draft</label>
            <textarea
              value={form.content_original}
              onChange={onChange('content_original')}
              style={{ ...inputStyle, minHeight: '220px', resize: 'vertical' }}
              placeholder="Write your story (at least ~50 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || status === 'submitting'}
            style={{
              padding: '14px 16px',
              borderRadius: 0,
              border: '1px solid color-mix(in oklab, var(--lux-accent) 30%, transparent)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              color: 'rgba(245,245,245,0.92)',
              fontWeight: 700,
              cursor: !canSubmit || status === 'submitting' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit for Review'}
          </button>

          {status === 'success' ? (
            <div
              style={{
                padding: '12px 14px',
                border: '1px solid rgba(34,197,94,0.35)',
                background: 'rgba(34,197,94,0.08)',
                color: 'rgba(235,242,255,0.92)',
              }}
            >
              Submitted. Dev will review soon.
            </div>
          ) : null}

          {status === 'error' ? (
            <div
              style={{
                padding: '12px 14px',
                border: '1px solid rgba(239,68,68,0.35)',
                background: 'rgba(239,68,68,0.08)',
                color: 'rgba(235,242,255,0.92)',
              }}
            >
              {error || 'Submission failed'}
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}
