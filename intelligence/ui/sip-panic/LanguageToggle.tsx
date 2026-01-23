"use client";

import { useState, useRef, useEffect } from "react";
import { LANG_OPTIONS } from "./i18n";
import { useLang } from "./LangContext";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DESIGN RULE: Premium dropdown language selector.
 * DO NOT revert to inline buttons - looks cheap.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function LanguageToggle(props: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const current = LANG_OPTIONS.find((o) => o.k === lang) ?? LANG_OPTIONS[0];

  return (
    <div ref={wrapperRef} className={`relative inline-block ${props.className ?? ""}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/90 hover:bg-white/10 transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-semibold">{current.nativeLabel}</span>
        <span className="text-white/50">({current.label})</span>
        <svg
          className={`ml-1 h-3 w-3 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl"
          role="listbox"
        >
          <div className="flex flex-wrap gap-2 p-2 min-w-[240px] max-w-[320px]">
            {LANG_OPTIONS.map((opt) => {
              const isActive = opt.k === lang;
              return (
                <button
                  key={opt.k}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setLang(opt.k);
                    setOpen(false);
                  }}
                  className={
                    "flex-1 min-w-[110px] rounded-xl px-3 py-2 text-left transition-colors duration-150 " +
                    (isActive
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white")
                  }
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{opt.nativeLabel}</span>
                    <span className="text-white/50 text-xs">({opt.label})</span>
                    {isActive && (
                      <span className="ml-auto text-xs font-semibold" style={{ color: "var(--lux-accent)" }}>
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
