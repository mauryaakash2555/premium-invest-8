export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    void (await request.json().catch(() => null));
    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Delete failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
