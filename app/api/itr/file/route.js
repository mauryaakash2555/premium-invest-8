export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    return NextResponse.json(
      {
        ok: false,
        error: 'gone',
        message:
          'Uploads are not persisted, so server-side file fetch is unavailable. Preview PDFs using a client-side blob/object URL instead.',
      },
      { status: 410, headers: { 'cache-control': 'no-store' } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'File fetch failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
