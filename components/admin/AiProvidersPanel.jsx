'use client';

/**
 * AI Providers Panel - Super easy dashboard showing:
 * - Which AI keys are configured
 * - Usage today (calls + tokens)
 * - What each AI does
 * - Status indicators
 */

function fmtNum(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '0';
  return x.toLocaleString('en-IN');
}

const AI_PROVIDERS = [
  {
    key: 'gemini',
    name: 'Gemini (Google)',
    icon: '🔷',
    color: '#4285F4',
    jobs: [
      'Public chatbot (primary)',
      'Live Mood text generation',
      'Live Intelligence "Why it matters"',
    ],
    envKey: 'GEMINI_API_KEY',
  },
  {
    key: 'groq',
    name: 'Groq (Llama)',
    icon: '🟣',
    color: '#8B5CF6',
    jobs: [
      'Admin chatbot (primary for family)',
      'Public chatbot (fallback)',
      'Live Intelligence classify/tag',
    ],
    envKey: 'GROQ_API_KEY',
  },
  {
    key: 'anthropic',
    name: 'Claude (Anthropic)',
    icon: '🟤',
    color: 'var(--lux-accent)',
    jobs: [
      'Super Admin only',
      'Strategy advisor',
      'Compliance sanitization',
    ],
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    key: 'openai',
    name: 'OpenAI (GPT-4o-mini)',
    icon: '🟢',
    color: '#10A37F',
    jobs: [
      'PDF brochure generation',
      'Market summary (backup)',
    ],
    envKey: 'OPENAI_API_KEY',
  },
];

export function AiProvidersPanel({ summary }) {
  const counts = summary?.today?.ai_provider_counts || {};
  const tokens = summary?.today?.ai_tokens_by_provider || {};
  const limits = summary?.today?.ai_daily_limits || {};

  // Compute which provider is most used today
  const mostUsed = Object.entries(counts)
    .filter(([k]) => k !== 'rule' && k !== 'cache')
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))[0];

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--lux-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          🤖 AI Providers
        </div>
        {mostUsed && mostUsed[1] > 0 && (
          <div style={{
            fontSize: 10,
            padding: '4px 8px',
            borderRadius: 8,
            background: 'color-mix(in oklab, var(--lux-accent) 15%, transparent)',
            color: 'color-mix(in oklab, var(--lux-accent) 90%, transparent)',
            fontWeight: 700,
          }}>
            Most used today: {mostUsed[0]?.toUpperCase()} ({fmtNum(mostUsed[1])} calls)
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
      }}>
        {AI_PROVIDERS.map((p) => {
          const callsToday = Number(counts[p.key] || 0);
          const tokensToday = Number(tokens[p.key] || 0);
          const limit = limits[p.key] || null;
          const remaining = limit ? Math.max(0, limit - callsToday) : null;
          const isActive = callsToday > 0;

          return (
            <div
              key={p.key}
              style={{
                padding: 16,
                borderRadius: 14,
                border: `1px solid ${isActive ? p.color + '40' : 'rgba(255,255,255,0.08)'}`,
                background: isActive
                  ? `linear-gradient(135deg, ${p.color}10 0%, transparent 100%)`
                  : 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }}>
                    {p.envKey}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isActive ? 'oklch(0.72 0.14 155)' : 'rgba(255,255,255,0.2)',
                  boxShadow: isActive ? '0 0 8px oklch(0.72 0.14 155)' : 'none',
                }} title={isActive ? 'Active today' : 'Not used today'} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 12,
              }}>
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.25)',
                }}>
                  <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Calls Today
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: p.color }}>
                    {fmtNum(callsToday)}
                  </div>
                </div>
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.25)',
                }}>
                  <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Tokens
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>
                    {tokensToday > 0 ? fmtNum(tokensToday) : '—'}
                  </div>
                </div>
              </div>

              {remaining !== null && (
                <div style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: remaining > 50 ? 'color-mix(in oklab, oklch(0.72 0.14 155) 10%, transparent)' : remaining > 10 ? 'color-mix(in oklab, oklch(0.78 0.10 85) 10%, transparent)' : 'color-mix(in oklab, oklch(0.65 0.18 25) 10%, transparent)',
                  marginBottom: 12,
                  fontSize: 11,
                  color: remaining > 50 ? 'oklch(0.72 0.14 155)' : remaining > 10 ? 'oklch(0.78 0.10 85)' : 'oklch(0.65 0.18 25)',
                  fontWeight: 700,
                }}>
                  {remaining} / {fmtNum(limit)} calls remaining today
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  What it does:
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, opacity: 0.75, lineHeight: 1.6 }}>
                  {p.jobs.map((j, i) => (
                    <li key={i}>{j}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 14,
        padding: 12,
        borderRadius: 10,
        background: 'color-mix(in oklab, var(--lux-accent) 8%, transparent)',
        border: '1px solid color-mix(in oklab, var(--lux-accent) 15%, transparent)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--lux-accent)' }}>💡 How it works:</strong>{' '}
        The system auto-picks providers based on user type. Super Admin gets Claude first, Family Admin gets Groq first, Public users get Gemini first.
        If the primary fails or hits rate limits, it falls back to the next provider automatically.
      </div>
    </section>
  );
}
