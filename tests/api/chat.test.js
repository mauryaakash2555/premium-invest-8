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
  getAIResponse: async () => ({ reply: 'ok', provider: 'mock' }),
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
  });

  test('rejects empty message', async () => {
    const res = await chatPOST(jsonReq({ message: '' }));
    expect(res.status).toBe(400);
  });

  test('rate limits excessive requests (best-effort)', async () => {
    const headers = { 'x-forwarded-for': '1.2.3.4' };
    let last;
    for (let i = 0; i < 11; i++) {
      last = await chatPOST(jsonReq({ message: 'hello' }, { headers }));
    }
    expect(last.status).toBe(429);
  });
});
