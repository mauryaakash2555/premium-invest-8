import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function GET() {
  // These env vars are typically present in Vercel deployments.
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || null;
  const ref = process.env.VERCEL_GIT_COMMIT_REF || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || null;
  const deploymentUrl = process.env.VERCEL_URL || null;

  return NextResponse.json({
    ok: true,
    sha,
    ref,
    deploymentUrl,
    now: new Date().toISOString(),
  });
}
