/** @jest-environment node */
/**
 * API Leads Endpoint Tests (unit-style: call route handler directly)
 */

import { POST as leadsPOST } from '@/app/api/leads/route';

function jsonReq(body) {
  return new Request('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

jest.mock('@/lib/db/leads', () => ({
  upsertLead: async (data) => ({ id: 'lead-1', ...data }),
}));

jest.mock('@/config/features', () => ({
  isFeatureEnabled: () => true,
}));

jest.mock('@/lib/plugins/loadPlugins', () => ({
  loadPlugins: async () => null,
}));

jest.mock('@/lib/plugins/PluginManager', () => ({
  runPluginHook: async () => null,
}));

describe('POST /api/leads', () => {
  test('accepts valid lead', async () => {
    const res = await leadsPOST(jsonReq({ name: 'Test User', email: 'test@example.com', phone: '9999999999' }));
    const j = await res.json();
    expect(res.status).toBe(200);
    expect(j.ok).toBe(true);
    expect(j.lead.id).toBeDefined();
  });

  test('rejects invalid email', async () => {
    const res = await leadsPOST(jsonReq({ name: 'Test', email: 'invalid-email', phone: '9999999999' }));
    expect(res.status).toBe(400);
  });

  test('rejects invalid phone', async () => {
    const res = await leadsPOST(jsonReq({ name: 'Test', email: 'test@example.com', phone: '123' }));
    expect(res.status).toBe(400);
  });
});

