export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    void request;
    return NextResponse.json(
      {
        ok: false,
        error: 'gone',
        message: 'No-storage mode: JSON export is client-side only.',
      },
      { status: 410, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Download failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
