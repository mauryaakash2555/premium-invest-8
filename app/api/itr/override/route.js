export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // No-storage mode: nothing to persist server-side.
    // Client updates field values locally.
    void (await request.json().catch(() => null));
    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Override failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
