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

import { POST as chatPOST } from '@/app/api/chat/route';
import { clearSmartCacheForTests } from '@/lib/cache/smartCache';
import { getAIResponse } from '@/lib/ai/provider';

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
      last = await chatPOST(jsonReq({ message: 'hello' }, { headers }));
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
});
