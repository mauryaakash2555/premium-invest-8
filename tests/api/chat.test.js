/** @jest-environment node */
/**
 * API Chat Endpoint Tests (unit-style: call route handler directly)
 */

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

// Make tests self-contained (no real network calls)
jest.mock('@/lib/ai/provider', () => ({
  getAIResponse: jest.fn(async () => ({ reply: 'ok', provider: 'mock' })),
}));

// Silence noisy logs in tests
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

jest.mock('@/lib/plugins/loadPlugins', () => ({
  loadPlugins: async () => null,
}));

jest.mock('@/lib/plugins/PluginManager', () => ({
  runPluginHook: async () => null,
}));

// Minimal in-memory conversation store for tests (avoids Supabase)
jest.mock('@/lib/db/conversations', () => {
  const store = new Map();
  function getArr(leadId) {
    const k = String(leadId || '');
    if (!store.has(k)) store.set(k, []);
    return store.get(k);
  }

  return {
    saveMessage: async ({ leadId, message, sender }) => {
      if (!leadId) return;
      getArr(leadId).push({
        id: 't',
        lead_id: leadId,
        message: String(message || ''),
        sender: sender === 'user' ? 'user' : 'bot',
        created_at: new Date().toISOString(),
      });
    },
    countUserMessagesSafe: async (leadId) => {
      if (!leadId) return 0;
      return getArr(leadId).filter((r) => r.sender === 'user').length;
    },
    listConversations: async ({ leadId, limit = 500, oldestFirst = true } = {}) => {
      const rows = leadId ? [...getArr(leadId)] : [];
      const ordered = oldestFirst ? rows : rows.slice().reverse();
      return ordered.slice(0, Number(limit || 500));
    },
  };
});

jest.mock('@/lib/db/leads', () => {
  let leadScoreValue = 0;
  return {
    __esModule: true,
    getLeadContactSafe: async () => ({ hasEmail: false, hasPhone: false }),
    getLeadNameSafe: async () => '',
    getLeadScoreSafe: async () => leadScoreValue,
    updateLeadScoreColumnSafe: async () => null,
    __setMockLeadScore: (v) => {
      leadScoreValue = Number(v || 0);
    },
  };
});

jest.mock('@/lib/db/events', () => ({
  logEventSafe: async () => null,
  saveLeadScoreEvent: async () => null,
}));

import { POST as chatPOST } from '@/app/api/chat/route';
import { clearSmartCacheForTests } from '@/lib/cache/smartCache';
import { getAIResponse } from '@/lib/ai/provider';
import * as LeadsDB from '@/lib/db/leads';

function jsonReq(body, { headers = {} } = {}) {
  return new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    process.env.GROQ_API_KEY = 'test-key';

    // Keep lead-scoring path off in tests unless explicitly needed.
    process.env.FEATURE_LEAD_SCORING = 'false';
    process.env.FEATURE_SMART_SMALLTALK_REDIRECT = 'false';

    clearSmartCacheForTests();
    getAIResponse.mockClear();
  });

  test('handles empty message gracefully', async () => {
    const res = await chatPOST(jsonReq({ message: '' }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.warn).toBe('bad_request');
    expect(typeof j.reply).toBe('string');
    expect(j.reply.length).toBeGreaterThan(0);
  });

  test('rate limits excessive requests (best-effort)', async () => {
    const headers = { 'x-forwarded-for': '1.2.3.4' };
    let last;
    for (let i = 0; i < 11; i++) {
      last = await chatPOST(jsonReq({ message: 'What is SIP?' }, { headers }));
    }
    expect(last.status).toBe(429);
  });

  test('serves repeated short question from smart cache', async () => {
    const r1 = await chatPOST(jsonReq({ message: 'What is SIP?' }));
    expect(r1.status).toBe(200);
    const j1 = await r1.json();
    expect(j1.ok).toBe(true);

    const r2 = await chatPOST(jsonReq({ message: 'What is SIP?' }));
    expect(r2.status).toBe(200);
    const j2 = await r2.json();
    expect(j2.ok).toBe(true);
    expect(j2.reply).toBe(j1.reply);

    // AI provider should only be called once due to cache hit on second request.
    expect(getAIResponse).toHaveBeenCalledTimes(1);
  });

  test('smalltalk does not trigger SIP/pitch/platforms', async () => {
    const res = await chatPOST(jsonReq({ message: 'hw r u' }));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.provider).toBe('rule');
    expect(j.affiliate_platforms).toBe(null);
    expect(j.pitch).toBe(null);
    expect(j.pitch_type).toBe(null);
    expect(String(j.reply || '').toLowerCase()).toContain('doing well');
    expect(getAIResponse).toHaveBeenCalledTimes(0);
  });

  test('smart smalltalk limiter: 3rd consecutive smalltalk returns suggestions', async () => {
    process.env.FEATURE_SMART_SMALLTALK_REDIRECT = 'true';
    const leadId = '00000000-0000-4000-8000-000000000000';

    const r1 = await chatPOST(jsonReq({ message: 'hi', leadId }));
    expect(r1.status).toBe(200);
    const j1 = await r1.json();
    expect(j1.ok).toBe(true);
    expect(j1.provider).toBe('rule');
    expect(j1.suggestions ?? null).toBe(null);

    const r2 = await chatPOST(jsonReq({ message: 'how are you', leadId }));
    expect(r2.status).toBe(200);
    const j2 = await r2.json();
    expect(j2.ok).toBe(true);
    expect(j2.provider).toBe('rule');
    expect(j2.suggestions ?? null).toBe(null);

    const r3 = await chatPOST(jsonReq({ message: "what's up", leadId }));
    expect(r3.status).toBe(200);
    const j3 = await r3.json();
    expect(j3.ok).toBe(true);
    expect(j3.provider).toBe('rule');
    expect(Array.isArray(j3.suggestions)).toBe(true);
    expect(j3.suggestions.length).toBe(3);
    expect(getAIResponse).toHaveBeenCalledTimes(0);
  });

  test('intent detection: tax → suggestions are tax-oriented on 3rd smalltalk', async () => {
    process.env.FEATURE_SMART_SMALLTALK_REDIRECT = 'true';
    const leadId = '00000000-0000-4000-8000-000000000000';

    const r0 = await chatPOST(jsonReq({ message: 'how to save tax?', leadId }));
    expect(r0.status).toBe(200);

    const r1 = await chatPOST(jsonReq({ message: 'hi', leadId }));
    const r2 = await chatPOST(jsonReq({ message: 'hello', leadId }));
    const r3 = await chatPOST(jsonReq({ message: "what's up", leadId }));
    const j3 = await r3.json();
    expect(Array.isArray(j3.suggestions)).toBe(true);
    expect(j3.suggestions.length).toBe(3);
    const s = j3.suggestions.join(' ').toLowerCase();
    expect(s).toMatch(/tax|80c|80d|elss/);
  });

  test('intent detection: sip → suggestions are sip-oriented on 3rd smalltalk', async () => {
    process.env.FEATURE_SMART_SMALLTALK_REDIRECT = 'true';
    const leadId = '00000000-0000-4000-8000-000000000001';

    const r0 = await chatPOST(jsonReq({ message: 'what is SIP', leadId }));
    expect(r0.status).toBe(200);

    const r1 = await chatPOST(jsonReq({ message: 'ok', leadId }));
    const r2 = await chatPOST(jsonReq({ message: 'thanks', leadId }));
    const r3 = await chatPOST(jsonReq({ message: 'nice', leadId }));
    const j3 = await r3.json();
    expect(Array.isArray(j3.suggestions)).toBe(true);
    expect(j3.suggestions.length).toBe(3);
    const s = j3.suggestions.join(' ').toLowerCase();
    expect(s).toMatch(/sip|calculator/);
  });

  test('feature flag off: no redirect after 3 smalltalks (no lead)', async () => {
    const r1 = await chatPOST(jsonReq({ message: 'hi' }));
    const r2 = await chatPOST(jsonReq({ message: 'hello' }));
    const r3 = await chatPOST(jsonReq({ message: "what's up" }));
    const j3 = await r3.json();
    expect(j3.suggestions ?? null).toBe(null);
  });

  test('hot lead: suggestions become consultation-focused', async () => {
    process.env.FEATURE_SMART_SMALLTALK_REDIRECT = 'true';
    LeadsDB.__setMockLeadScore(85);
    const leadId = '00000000-0000-4000-8000-000000000000';

    const r0 = await chatPOST(jsonReq({ message: 'planning ₹10L investment with multiple goals', leadId }));
    expect(r0.status).toBe(200);

    const r1 = await chatPOST(jsonReq({ message: 'hi', leadId }));
    const r2 = await chatPOST(jsonReq({ message: 'hello', leadId }));
    const r3 = await chatPOST(jsonReq({ message: "what's up", leadId }));
    const j3 = await r3.json();
    expect(Array.isArray(j3.suggestions)).toBe(true);
    const s = j3.suggestions.join(' ').toLowerCase();
    expect(s).toMatch(/consultation|roadmap|portfolio/);
    LeadsDB.__setMockLeadScore(0);
  });

  test('calculator routing: returns SIP calculator CTA for follow-up', async () => {
    const leadId = '00000000-0000-4000-8000-000000000000';

    const res = await chatPOST(
      jsonReq({
        message: 'show me any',
        leadId,
        conversationHistory: [
          { role: 'bot', message: 'We have SIP calculators available.' },
          { role: 'user', message: 'do u have any calculator' },
        ],
      })
    );
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.provider).toBe('rule');
    expect(j.cta?.href).toBe('/sip-calculator');
    expect(getAIResponse).toHaveBeenCalledTimes(0);
  });
});
