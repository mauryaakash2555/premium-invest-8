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
    transition: 'border-color 160ms ease, box-shadow 160ms ease',
  };
}

export default function GuestColumnForm() {
  const formId = useId();

  const initial = useMemo(
    () => ({
      title: '',
      article_content: '',
      expertise_area: '',
      author_name: '',
      author_credentials: '',
      author_bio: '',
      author_linkedin: '',
      author_email: '',
      sources_references: '',
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
      const res = await fetch('/api/submit/guest', {
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
        message: 'Submitted. Editorial team will review and may suggest edits before publication.',
      });
      setFormData(initial);
    } catch {
      setStatus({ state: 'error', message: 'network_error' });
    }
  }

  return (
    <div className="min-h-screen py-20" style={{ background: OKLCH.background, color: OKLCH.text }}>
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
            Submit Guest Column
          </h1>
          <p className="text-lg mb-8" style={{ color: OKLCH.textMuted }}>
            Share your professional expertise with our audience.
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

          <form className="space-y-8" onSubmit={onSubmit} aria-describedby={`${formId}-note`}>
            <FieldShell label="Article Title" required>
              <input
                id={`${formId}-title`}
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Why Mumbai's Real Estate Prices Don't Reflect True Value"
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

            <FieldShell label="Your Area of Expertise" required>
              <select
                id={`${formId}-expertise`}
                name="expertise_area"
                required
                value={formData.expertise_area}
                onChange={(e) => updateField('expertise_area', e.target.value)}
                className="focus:outline-none"
                style={{
                  ...inputBaseStyle(status.state === 'submitting'),
                  appearance: 'none',
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
              >
                <option value="" style={{ color: OKLCH.ink }}>
                  Select…
                </option>
                <option value="finance" style={{ color: OKLCH.ink }}>
                  Finance & Investment
                </option>
                <option value="legal" style={{ color: OKLCH.ink }}>
                  Legal & Regulatory
                </option>
                <option value="taxation" style={{ color: OKLCH.ink }}>
                  Taxation
                </option>
                <option value="real-estate" style={{ color: OKLCH.ink }}>
                  Real Estate
                </option>
                <option value="healthcare" style={{ color: OKLCH.ink }}>
                  Healthcare
                </option>
                <option value="policy" style={{ color: OKLCH.ink }}>
                  Public Policy
                </option>
                <option value="other" style={{ color: OKLCH.ink }}>
                  Other
                </option>
              </select>
              <p className="mt-2 text-sm" style={{ color: OKLCH.textDim }}>
                Choose the closest match. We’ll tag it correctly before publishing.
              </p>
            </FieldShell>

            <FieldShell label="Article Content" required hint="Minimum 800 words">
              <textarea
                id={`${formId}-content`}
                name="article_content"
                required
                rows={20}
                value={formData.article_content}
                onChange={(e) => updateField('article_content', e.target.value)}
                placeholder="Write your full article here. Include data, examples, analysis, and conclusions."
                className="focus:outline-none font-mono text-sm"
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
              <p className="mt-2 text-sm" style={{ color: OKLCH.textDim }}>
                Use clear structure with headings. Avoid promotional links inside the body.
              </p>
            </FieldShell>

            <FieldShell label="Sources & References">
              <textarea
                id={`${formId}-sources`}
                name="sources_references"
                rows={4}
                value={formData.sources_references}
                onChange={(e) => updateField('sources_references', e.target.value)}
                placeholder="List all sources, studies, reports, laws cited in your article"
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
                Author Credentials (Required for Verification)
              </h3>

              <div className="space-y-4">
                <FieldShell label="Full Name" required>
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

                <FieldShell label="Professional Credentials" required>
                  <input
                    id={`${formId}-credentials`}
                    name="author_credentials"
                    type="text"
                    required
                    value={formData.author_credentials}
                    onChange={(e) => updateField('author_credentials', e.target.value)}
                    placeholder="e.g., Chartered Accountant (15+ years), Senior Advocate, Mumbai High Court"
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

                <FieldShell label="Short Bio (150 words max)" required>
                  <textarea
                    id={`${formId}-bio`}
                    name="author_bio"
                    required
                    rows={4}
                    value={formData.author_bio}
                    onChange={(e) => updateField('author_bio', e.target.value)}
                    placeholder="Brief professional background, current role, notable achievements"
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

                <FieldShell label="LinkedIn Profile" required hint="Required for credential verification">
                  <input
                    id={`${formId}-linkedin`}
                    name="author_linkedin"
                    type="url"
                    required
                    value={formData.author_linkedin}
                    onChange={(e) => updateField('author_linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
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

                <FieldShell label="Email" required>
                  <input
                    id={`${formId}-email`}
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

                <p id={`${formId}-note`} className="text-sm" style={{ color: OKLCH.textDim }}>
                  Editorial team will review and may suggest edits before publication.
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
              {status.state === 'submitting' ? 'Submitting…' : 'Submit for Editorial Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
