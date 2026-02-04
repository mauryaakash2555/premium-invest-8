'use client';

import { useId, useMemo, useState } from 'react';

const OKLCH = {
  // Extracted from bmwealth.co.in/about linked CSS bundles (OKLCH-only).
  background: 'oklch(100% 0 0)',
  panel: 'oklch(98.5% 0 0)',
  panel2: 'oklch(97% 0 0)',
  text: 'oklch(14.5% 0 0)',
  textMuted: 'oklch(55.6% 0 0)',
  textDim: 'oklch(43.9% 0 0)',
  border: 'oklch(92.2% 0 0)',
  gold: 'oklch(78% .08 65)',
  goldRing: 'oklch(78% .08 65/.3)',
  buttonBg: 'oklch(95% .01 85)',
  ink: 'oklch(6% .005 280)',
  danger: 'oklch(63.7% .237 25.331)',
  dangerBg: 'oklch(97.1% .013 17.38)',
};

function FieldShell({ label, required, hint, children }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <label className="block font-semibold" style={{ color: OKLCH.text }}>
          {label}
          {required ? <span style={{ color: OKLCH.gold }}> *</span> : null}
        </label>
        {hint ? (
          <span className="text-sm" style={{ color: OKLCH.textDim }}>
            {hint}
          </span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function inputBaseStyle(disabled) {
  return {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1px solid ${OKLCH.border}`,
    background: disabled ? OKLCH.panel2 : OKLCH.background,
    color: OKLCH.text,
    outline: 'none',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
  };
}

export default function CommunityImpactForm() {
  const formId = useId();

  const initial = useMemo(
    () => ({
      title: '',
      what_happened: '',
      when_happened: '',
      where_happened: '',
      who_affected: '',
      evidence_proof: '',
      impact_result: '',
      author_name: '',
      author_email: '',
      location_tag: '',
      anonymous: false,
    }),
    []
  );

  const [formData, setFormData] = useState(initial);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  function updateField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ state: 'submitting', message: '' });

    try {
      const res = await fetch('/api/submit/impact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        setStatus({ state: 'error', message: String(j?.error || 'submit_failed') });
        return;
      }

      setStatus({
        state: 'success',
        message: 'Submitted. Our editorial team will review your story before publishing.',
      });
      setFormData(initial);
    } catch {
      setStatus({ state: 'error', message: 'network_error' });
    }
  }

  return (
    <div
      className="min-h-screen py-20"
      style={{
        background: OKLCH.background,
        color: OKLCH.text,
      }}
    >
      <div className="mx-auto max-w-4xl px-4">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: OKLCH.panel,
            border: `1px solid ${OKLCH.border}`,
            boxShadow: `0 30px 120px ${OKLCH.goldRing}`,
          }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: OKLCH.text }}>
            Share Your Community Impact Story
          </h1>
          <p className="text-lg mb-8" style={{ color: OKLCH.textMuted }}>
            Real stories. Real impact. Help make change happen.
          </p>

          {status.state === 'success' ? (
            <div
              className="mb-8 rounded-xl px-4 py-3"
              style={{
                border: `1px solid ${OKLCH.gold}`,
                background: OKLCH.panel2,
              }}
              role="status"
            >
              <div className="font-semibold" style={{ color: OKLCH.gold }}>
                Thank you
              </div>
              <div className="mt-1 text-sm" style={{ color: OKLCH.textMuted }}>
                {status.message}
              </div>
            </div>
          ) : null}

          {status.state === 'error' ? (
            <div
              className="mb-8 rounded-xl px-4 py-3"
              style={{
                border: `1px solid ${OKLCH.danger}`,
                background: OKLCH.dangerBg,
              }}
              role="alert"
            >
              <div className="font-semibold" style={{ color: OKLCH.danger }}>
                Submission failed
              </div>
              <div className="mt-1 text-sm" style={{ color: OKLCH.ink }}>
                Please retry. ({status.message})
              </div>
            </div>
          ) : null}

          <form className="space-y-8" onSubmit={onSubmit} aria-describedby={`${formId}-privacy`}>
            <FieldShell label="Story Title" required hint="Be specific and factual">
              <input
                id={`${formId}-title`}
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Property Registration Demanded ₹50,000 Bribe at Andheri Office"
                className="focus:outline-none"
                style={inputBaseStyle(status.state === 'submitting')}
                disabled={status.state === 'submitting'}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </FieldShell>

            <FieldShell label="What Happened?" required>
              <textarea
                id={`${formId}-what`}
                name="what_happened"
                required
                rows={6}
                value={formData.what_happened}
                onChange={(e) => updateField('what_happened', e.target.value)}
                placeholder="Describe the incident in detail. What exactly happened? Be as specific as possible."
                className="focus:outline-none"
                style={{
                  ...inputBaseStyle(status.state === 'submitting'),
                  resize: 'vertical',
                }}
                disabled={status.state === 'submitting'}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </FieldShell>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldShell label="When did this happen?" required>
                <input
                  id={`${formId}-when`}
                  name="when_happened"
                  type="date"
                  required
                  value={formData.when_happened}
                  onChange={(e) => updateField('when_happened', e.target.value)}
                  className="focus:outline-none"
                  style={inputBaseStyle(status.state === 'submitting')}
                  disabled={status.state === 'submitting'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = OKLCH.gold;
                    e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = OKLCH.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </FieldShell>

              <FieldShell label="Where? (Location)" required>
                <input
                  id={`${formId}-where`}
                  name="where_happened"
                  type="text"
                  required
                  value={formData.where_happened}
                  onChange={(e) => updateField('where_happened', e.target.value)}
                  placeholder="e.g., Sub-Registrar Office, Andheri West"
                  className="focus:outline-none"
                  style={inputBaseStyle(status.state === 'submitting')}
                  disabled={status.state === 'submitting'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = OKLCH.gold;
                    e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = OKLCH.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </FieldShell>
            </div>

            <FieldShell label="Who was affected?">
              <input
                id={`${formId}-who`}
                name="who_affected"
                type="text"
                value={formData.who_affected}
                onChange={(e) => updateField('who_affected', e.target.value)}
                placeholder="e.g., Me and my family, 50+ people in queue"
                className="focus:outline-none"
                style={inputBaseStyle(status.state === 'submitting')}
                disabled={status.state === 'submitting'}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </FieldShell>

            <FieldShell label="Evidence / Proof" hint="Evidence strengthens your story">
              <textarea
                id={`${formId}-evidence`}
                name="evidence_proof"
                rows={4}
                value={formData.evidence_proof}
                onChange={(e) => updateField('evidence_proof', e.target.value)}
                placeholder="Do you have: Photos, videos, receipts, documents, witness names, official complaint numbers? List what you have."
                className="focus:outline-none"
                style={{
                  ...inputBaseStyle(status.state === 'submitting'),
                  resize: 'vertical',
                }}
                disabled={status.state === 'submitting'}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </FieldShell>

            <FieldShell label="What was the impact/result?" required>
              <textarea
                id={`${formId}-impact`}
                name="impact_result"
                required
                rows={4}
                value={formData.impact_result}
                onChange={(e) => updateField('impact_result', e.target.value)}
                placeholder="Financial loss? Health impact? Time wasted? Emotional stress? Be specific with numbers if possible."
                className="focus:outline-none"
                style={{
                  ...inputBaseStyle(status.state === 'submitting'),
                  resize: 'vertical',
                }}
                disabled={status.state === 'submitting'}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.gold;
                  e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = OKLCH.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </FieldShell>

            <div className="pt-6" style={{ borderTop: `1px solid ${OKLCH.border}` }}>
              <h3 className="font-bold mb-4" style={{ color: OKLCH.text }}>
                Your Details
              </h3>

              <div className="space-y-4">
                <FieldShell label="Your Name" required>
                  <input
                    id={`${formId}-author-name`}
                    name="author_name"
                    type="text"
                    required
                    value={formData.author_name}
                    onChange={(e) => updateField('author_name', e.target.value)}
                    className="focus:outline-none"
                    style={inputBaseStyle(status.state === 'submitting')}
                    disabled={status.state === 'submitting'}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = OKLCH.gold;
                      e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = OKLCH.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </FieldShell>

                <FieldShell label="Email" required hint="We’ll contact you for verification">
                  <input
                    id={`${formId}-author-email`}
                    name="author_email"
                    type="email"
                    required
                    value={formData.author_email}
                    onChange={(e) => updateField('author_email', e.target.value)}
                    className="focus:outline-none"
                    style={inputBaseStyle(status.state === 'submitting')}
                    disabled={status.state === 'submitting'}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = OKLCH.gold;
                      e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = OKLCH.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </FieldShell>

                <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: OKLCH.panel2, border: `1px solid ${OKLCH.border}` }}>
                  <input
                    id={`${formId}-anonymous`}
                    name="anonymous"
                    type="checkbox"
                    checked={formData.anonymous}
                    onChange={(e) => updateField('anonymous', e.target.checked)}
                    className="mt-1"
                    style={{ accentColor: OKLCH.gold }}
                    disabled={status.state === 'submitting'}
                  />
                  <label htmlFor={`${formId}-anonymous`} style={{ color: OKLCH.textMuted }}>
                    Publish anonymously (your identity stays private)
                  </label>
                </div>

                <div>
                  <label className="block font-semibold" htmlFor={`${formId}-location-tag`} style={{ color: OKLCH.text }}>
                    Location Tag (optional)
                  </label>
                  <input
                    id={`${formId}-location-tag`}
                    name="location_tag"
                    type="text"
                    value={formData.location_tag}
                    onChange={(e) => updateField('location_tag', e.target.value)}
                    placeholder="e.g., Mumbai, Maharashtra"
                    className="mt-2 focus:outline-none"
                    style={inputBaseStyle(status.state === 'submitting')}
                    disabled={status.state === 'submitting'}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = OKLCH.gold;
                      e.currentTarget.style.boxShadow = `0 0 0 6px ${OKLCH.goldRing}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = OKLCH.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <p id={`${formId}-privacy`} className="text-sm" style={{ color: OKLCH.textDim }}>
                  Your story will be reviewed by our editorial team before publishing.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={status.state === 'submitting'}
              className="w-full py-4 rounded-xl font-bold transition"
              style={{
                background: OKLCH.buttonBg,
                color: OKLCH.ink,
                border: `1px solid ${OKLCH.gold}`,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: `0 18px 70px ${OKLCH.goldRing}`,
                opacity: status.state === 'submitting' ? 0.75 : 1,
                cursor: status.state === 'submitting' ? 'not-allowed' : 'pointer',
              }}
            >
              {status.state === 'submitting' ? 'Submitting…' : 'Submit Story for Review'}
            </button>

            <p className="text-sm text-center" style={{ color: OKLCH.textDim }}>
              Please avoid sharing sensitive personal information (IDs, bank numbers).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
