"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import SIPPanicPage from "./SIPPanicPage";
import { SocialProofBanner } from "./SocialProofBanner";
import { StoryStatsBanner } from "./StoryStatsBanner";

function buildNextSearchParams(current: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(patch)) {
    if (v === null) next.delete(k);
    else next.set(k, v);
  }
  return next;
}

export default function StoryLandingShell() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const alreadyStory = searchParams?.get("story") === "1";
  const alreadyUi = (searchParams?.get("ui") || "").toLowerCase() === "beginner";

  const patchedHref = useMemo(() => {
    const current = new URLSearchParams(searchParams?.toString() || "");
    const next = buildNextSearchParams(current, {
      story: "1",
      ui: "beginner",
    });
    return `${pathname}?${next.toString()}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    // Guarantee the default story experience.
    if (!pathname) return;
    if (alreadyStory && alreadyUi) return;
    router.replace(patchedHref, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyStory, alreadyUi, patchedHref]);

  return (
    <>
      <section className="px-6 lg:px-10 pt-10 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/25 p-6">
            <div>
              <div className="text-[11px] font-semibold tracking-wide text-white/70">STORY MODE (2 MIN)</div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold gold-gradient-text">
                SIP Crash Story Simulator
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/75 leading-relaxed">
                Pick your crash behavior and instantly see the education-only, post-tax cost of fear vs discipline.
                Built for clarity, sharing, and learning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold text-white/85">1) Set inputs</div>
                <div className="mt-1 text-xs text-white/65">Monthly SIP + horizon</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold text-white/85">2) Choose behavior</div>
                <div className="mt-1 text-xs text-white/65">Stop / pause / continue</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold text-white/85">3) Share result</div>
                <div className="mt-1 text-xs text-white/65">WhatsApp-ready preview</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#sim"
                className="inline-flex items-center justify-center rounded-full bg-[oklch(0.78_0.08_65)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
              >
                Start the story
              </a>
              <Link
                href="/intelligence/sip-vs-panic"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/25 px-5 py-2 text-sm font-semibold text-white/85 hover:bg-black/35"
              >
                Open full simulator
              </Link>
              <Link
                href="/intelligence/sip-vs-panic/guide"
                className="text-sm text-[oklch(0.78_0.08_65)] hover:opacity-90"
              >
                Read the guide →
              </Link>
            </div>

            <SocialProofBanner />
            <StoryStatsBanner />
          </div>
        </div>
      </section>

      <div id="sim">
        <SIPPanicPage />
      </div>
    </>
  );
}
