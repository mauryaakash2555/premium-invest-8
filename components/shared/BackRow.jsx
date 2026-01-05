"use client";

import Link from "next/link";

export default function BackRow({ href = "/", label = "\u2190 Back to Home" }) {
  function handleBackClick(e) {
    try { sessionStorage.setItem("exit_intent_suppress", "1"); } catch {}
    // let the browser navigate normally; add a safety hard nav for older browsers
    try {
      // In case some overlay intercepts SPA routing, force a hard navigation
      const to = href || "/";
      setTimeout(() => { if (typeof window !== "undefined") window.location.assign(to); }, 0);
    } catch {}
  }

  return (
    <div className="px-6 py-3 lg:px-10 mt-24 text-xs text-slate-300/80 flex items-center gap-4" style={{ position: "relative", zIndex: 2 }}>
      <Link href={href} onClick={handleBackClick} className="hover:underline">{label}</Link>
    </div>
  );
}
