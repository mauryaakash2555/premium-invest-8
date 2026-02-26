import { NextResponse } from 'next/server';
import { getEditorialImageOverrides } from '@/lib/blog/editorialImageOverrides.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const overrides = await getEditorialImageOverrides();
  return NextResponse.json(
    { ok: true, overrides: overrides && typeof overrides === 'object' ? overrides : {} },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
  );
}
