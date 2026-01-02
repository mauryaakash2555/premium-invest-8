/**
 * FILE: components\user\AIChatFloat.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - react
 * - ./AIChatFloat.module.css
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./AIChatFloat.module.css";
import { isFeatureEnabled } from "@/config/features";
import { FamilyAdminView } from "@/components/admin/FamilyAdminView";
import { createTrackedLink, logClick } from "@/lib/affiliate/tracker";

const COMPLIANCE_TEXT =
  "Welcome to BM Wealth. We provide educational guidance and product\n" +
  "distribution services. AMFI Registered | IRDAI Licensed |\n" +
  "Investments subject to market dynamics.";

// Feature flags (client-side uses NEXT_PUBLIC_FEATURE_* env vars)
const FEATURE_LEAD_CAPTURE = isFeatureEnabled("LEAD_CAPTURE");
const FEATURE_TIME_GREETINGS = isFeatureEnabled("TIME_GREETINGS");
const FEATURE_REVENUE_TRACKING = isFeatureEnabled("REVENUE_TRACKING");
const FEATURE_ANALYTICS = isFeatureEnabled("ANALYTICS");
const FEATURE_CLAUDE_ADMIN = isFeatureEnabled("CLAUDE_ADMIN");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function normalizePhone(v) {
  const digits = String(v || "").replace(/[^\d+]/g, "");
  // accept +91... or 10 digits
  if (digits.startsWith("+") && digits.length >= 10) return digits;
  const only = digits.replace(/[^\d]/g, "");
  if (only.length >= 10) return only.slice(-10);
  return "";
}

function todayISO() {
  return new Date().toISOString();
}

function dayGreeting() {
  try {
    if (!FEATURE_TIME_GREETINGS) return "Hello!";
    const h = new Date().getHours();
    // User-local time ranges:
    // 5 AM - 12 PM: Good morning
    // 12 PM - 5 PM: Good afternoon
    // 5 PM - 10 PM: Good evening
    // 10 PM - 5 AM: Hello
    if (h >= 5 && h < 12) return "Good morning!";
    if (h >= 12 && h < 17) return "Good afternoon!";
    if (h >= 17 && h < 22) return "Good evening!";
    return "Hello!";
  } catch {
    return "Hello!";
  }
}

function fmtINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  try {
    return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(num);
  } catch {
    return "₹" + Math.round(num).toString();
  }
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

function wantsHuman(text) {
  const t = String(text || "").toLowerCase();
  return (
    t.includes("human") ||
    t.includes("agent") ||
    t.includes("customer support") ||
    t.includes("support") ||
    t.includes("call me") ||
    t.includes("talk to") ||
    t.includes("contact") ||
    t.includes("need help") ||
    t.includes("help")
  );
}

function isGreetingOnly(text) {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return false;
  if (t.length > 32) return false;
  if (/\?/.test(t)) return false;
  return /^(hi|hii+|hello|hey|good\s+morning|good\s+afternoon|good\s+evening|namaste)\b/.test(t);
}

export default function AIChatFloat({ open, onClose, whatsappHref }) {
  // Safety: keep it OFF unless explicitly enabled via env flag.
  const flag = process.env.NEXT_PUBLIC_AI_CHAT_ENABLED;
  const enabled = flag ? flag === "true" : true;

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [familyAdmin, setFamilyAdmin] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [leadDraft, setLeadDraft] = useState({ name: "", email: "", phone: "" });
  const [captureStep, setCaptureStep] = useState(() => (FEATURE_LEAD_CAPTURE ? "name" : "done")); // name|email|phone|done
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState("chat"); // chat|dashboard|analytics|family|family
  const [humanReady, setHumanReady] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState("");
  const [revenueSource, setRevenueSource] = useState("Other"); // Affiliate|Lead Sale|Product|Other
  const [revenueNote, setRevenueNote] = useState("");
  const [revenueBusy, setRevenueBusy] = useState(false);
  const [revenueErr, setRevenueErr] = useState("");
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null); // { lead, conversations }
  const [leadDetailBusy, setLeadDetailBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportNote, setExportNote] = useState("");
  const [exportFilter, setExportFilter] = useState("all"); // all|hot|today
  const [analytics, setAnalytics] = useState(null);
  const [analyticsBusy, setAnalyticsBusy] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [strategyBusy, setStrategyBusy] = useState(false);

  function exitAdminMode() {
    setAdmin(false);
    setTab("chat");
    setDashboard(null);
    setSelectedLeadId(null);
    setLeadDetail(null);
    pushBotAdmin("Exited admin mode.");
  }

  async function exitFamilyAdminMode() {
    setFamilyAdmin(false);
    setTab("chat");
    pushBotUser("Exited family admin mode.");
    try {
      await fetch("/api/admin/family/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }

  async function tryFamilyLogin(password) {
    const r = await fetch("/api/admin/family/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await r.json().catch(() => null);
    if (r.status === 503 && j?.error === "setup_required") return { ok: false, setupRequired: true };
    if (!r.ok) return { ok: false, setupRequired: false };
    return { ok: Boolean(j?.ok), setupRequired: false };
  }
  async function exportLeads() {
    if (!admin || exportBusy) return;
    setExportBusy(true);
    setExportNote("");
    try {
      const qs = new URLSearchParams();
      if (exportFilter && exportFilter !== "all") qs.set("filter", exportFilter);
      const r = await fetch(`/api/admin/export?${qs.toString()}`, { method: "GET" });
      if (!r.ok) {
        setExportNote("Export failed.");
        return;
      }
      const count = r.headers.get("x-export-count") || "";
      const cd = r.headers.get("content-disposition") || "";
      const m = cd.match(/filename=\"?([^\";]+)\"?/i);
      const filename = m?.[1] || `bm-wealth-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setExportNote(`Downloaded ${count || "0"} leads`);
    } finally {
      setExportBusy(false);
    }
  }

  const sessionId = useMemo(() => {
    try {
      // eslint-disable-next-line no-undef
      return crypto?.randomUUID?.() || Math.random().toString(16).slice(2);
    } catch {
      return Math.random().toString(16).slice(2);
    }
  }, []);
  const visitorLoggedRef = useRef(false);
  const convoStartedRef = useRef(false);
  const pitchStateRef = useRef({ lastPitchAt: null, seenPitches: [] });
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      id: "m0",
      sender: "bot",
      at: todayISO(),
      text:
        `${dayGreeting()}\n\n${COMPLIANCE_TEXT}\n\n${
          FEATURE_LEAD_CAPTURE ? "To provide a premium experience, may I have your name?" : "How can I help you today?"
        }`,
    },
  ]);
  const [adminMessages, setAdminMessages] = useState(() => [
    {
      id: "a0",
      sender: "bot",
      at: todayISO(),
      text: "Admin console ready. Ask for strategic advice any time.",
    },
  ]);

  const activeMessages = admin ? adminMessages : messages;

  useEffect(() => {
    if (!enabled || !open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [enabled, open, admin, messages.length, adminMessages.length, busy]);

  // Analytics: visitor event (privacy-safe ipHash is added server-side).
  useEffect(() => {
    if (!enabled || !open) return;
    if (visitorLoggedRef.current) return;
    visitorLoggedRef.current = true;
    void logEvent("visitor", { sessionId });
  }, [enabled, open, sessionId]);

  function pushBotUser(text, extra = null) {
    setMessages((prev) => [
      ...prev,
      {
        id: "b_" + Date.now().toString(16),
        sender: "bot",
        at: todayISO(),
        text: String(text || ""),
        ...(extra && typeof extra === "object" ? extra : {}),
      },
    ]);
  }

  function pushUserUser(text) {
    setMessages((prev) => [
      ...prev,
      { id: "u_" + Date.now().toString(16), sender: "user", at: todayISO(), text: String(text || "") },
    ]);
  }

  function pushBotAdmin(text, extra = null) {
    setAdminMessages((prev) => [
      ...prev,
      {
        id: "ab_" + Date.now().toString(16),
        sender: "bot",
        at: todayISO(),
        text: String(text || ""),
        ...(extra && typeof extra === "object" ? extra : {}),
      },
    ]);
  }

  function pushUserAdmin(text) {
    setAdminMessages((prev) => [
      ...prev,
      { id: "au_" + Date.now().toString(16), sender: "user", at: todayISO(), text: String(text || "") },
    ]);
  }

  async function tryAdminLogin(password) {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await r.json().catch(() => null);
    if (r.status === 503 && j?.error === "setup_required") {
      return { ok: false, setupRequired: true };
    }
    if (!r.ok) return { ok: false, setupRequired: false };
    return { ok: Boolean(j?.ok), setupRequired: false };
  }

  async function refreshDashboard() {
    const r = await fetch("/api/admin/summary", { method: "GET" });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    return j?.ok ? j : null;
  }

  async function fetchLeadDetail(id) {
    if (!id) return null;
    setLeadDetailBusy(true);
    try {
      const r = await fetch(`/api/admin/summary?leadId=${encodeURIComponent(id)}`, { method: "GET" });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) return null;
      return j;
    } finally {
      setLeadDetailBusy(false);
    }
  }

  async function fetchAnalytics() {
    setAnalyticsBusy(true);
    try {
      const r = await fetch("/api/admin/analytics", { method: "GET" });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) return null;
      return j;
    } finally {
      setAnalyticsBusy(false);
    }
  }

  async function fetchStrategy({ force = false } = {}) {
    setStrategyBusy(true);
    try {
      const qs = force ? "?force=1" : "";
      const r = await fetch(`/api/admin/strategy${qs}`, { method: "GET" });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) return null;
      return j;
    } finally {
      setStrategyBusy(false);
    }
  }

  function StatCard({ label, value, sub }) {
    return (
      <div className={styles.statCard}>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
        {sub ? <div className={styles.statSub}>{sub}</div> : null}
      </div>
    );
  }

  function MiniLine({ data = [], aKey = "leads", bKey = "visitors" }) {
    const w = 320;
    const h = 90;
    const pad = 10;
    const max = Math.max(
      1,
      ...data.map((d) => Math.max(Number(d?.[aKey]) || 0, Number(d?.[bKey]) || 0))
    );
    const xStep = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
    const y = (v) => h - pad - ((Number(v) || 0) / max) * (h - pad * 2);
    const x = (i) => pad + i * xStep;

    const pathFor = (key) =>
      data
        .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d?.[key]).toFixed(1)}`)
        .join(" ");

    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className={styles.miniChart} aria-hidden="true">
        <path d={pathFor(bKey)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        <path d={pathFor(aKey)} fill="none" stroke="rgba(192,160,98,0.95)" strokeWidth="2.5" />
      </svg>
    );
  }

  function MiniDonut({ hot = 0, warm = 0, cold = 0 }) {
    const total = Math.max(1, hot + warm + cold);
    const cx = 38;
    const cy = 38;
    const r = 28;
    const c = 2 * Math.PI * r;
    const seg = [
      { v: hot, color: "rgba(255,80,80,0.9)" },
      { v: warm, color: "rgba(255,200,90,0.9)" },
      { v: cold, color: "rgba(255,255,255,0.35)" },
    ];
    let acc = 0;
    return (
      <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="10" />
        {seg.map((s, idx) => {
          const frac = s.v / total;
          const dash = frac * c;
          const offset = c - acc;
          acc += dash;
          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="10"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
      </svg>
    );
  }

  async function upsertLead({ name, email, phone }) {
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const j = await r.json().catch(() => null);

    if (r.status === 503 && j?.error === "setup_required") {
      return { lead: null, setupRequired: true, hint: j?.hint || j?.detail || null };
    }

    if (!r.ok || !j?.ok) {
      return { lead: null, setupRequired: false, error: j?.error || "lead_capture_failed" };
    }

    return { lead: j.lead, setupRequired: false, error: null };
  }

  function buildConversationHistorySnapshot() {
    try {
      const base = admin ? adminMessages : messages;
      return (base || [])
        // Exclude the initial compliance/onboarding message so models don't echo it back.
        .filter((m) => {
          if (!m) return false;
          if (!admin && m.id === "m0") return false;
          if (!(m.sender === "user" || m.sender === "bot")) return false;
          // Drop greeting-only user messages from context to prevent "hi" being echoed.
          if (m.sender === "user" && isGreetingOnly(m.text)) return false;
          return true;
        })
        .slice(-10)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "bot",
          message: String(m.text || "").trim().slice(0, 2000),
        }))
        .filter((m) => m.message);
    } catch {
      return [];
    }
  }

  async function sendChat({ message, mode, leadId: lid, conversationHistory }) {
    const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v || ""));

    const rawPitchState = !admin ? pitchStateRef.current : undefined;
    const normalizedPitchState = (() => {
      if (!rawPitchState || typeof rawPitchState !== "object") return undefined;

      const lastPitchAtNum = Number(rawPitchState.lastPitchAt);
      const lastPitchAt = Number.isFinite(lastPitchAtNum) && lastPitchAtNum >= 0 ? lastPitchAtNum : undefined;

      const seenPitches = Array.isArray(rawPitchState.seenPitches)
        ? rawPitchState.seenPitches
            .map((x) => String(x || "").trim())
            .filter(Boolean)
            .slice(0, 30)
        : undefined;

      if (typeof lastPitchAt === "undefined" && typeof seenPitches === "undefined") return undefined;
      return { lastPitchAt, seenPitches };
    })();

    const conversationIdSafe = typeof sessionId === "string" && sessionId.trim().length > 0 ? sessionId.trim() : undefined;

    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode,
        leadId: isUuid(lid) ? lid : undefined,
        conversationId: conversationIdSafe,
        conversationHistory: conversationHistory || undefined,
        pitchState: normalizedPitchState,
      }),
    });
    const j = await r.json().catch(() => null);
    if (r.status === 429 || j?.error === "rate_limited") {
      const adminMode = mode === "admin";
      return {
        reply: adminMode
          ? "Rate limit: please send up to 50 messages per hour in admin mode."
          : "Just a moment — please send up to 10 messages per minute so we can keep the concierge experience smooth.",
        warn: "rate_limited",
      };
    }
    if (!r.ok || !j?.ok) return { reply: "Temporary issue. Please try again.", warn: j?.error || "bad_response" };
    return {
      reply: j.reply || "",
      warn: j.warn,
      cta: j.cta || null,
      intent: j.intent || null,
      affiliatePlatforms: Array.isArray(j?.affiliate_platforms) ? j.affiliate_platforms : null,
      pitch: j.pitch || null,
      pitchType: typeof j?.pitch_type === "string" ? j.pitch_type : null,
      suggestions: Array.isArray(j?.suggestions) ? j.suggestions.filter(Boolean).slice(0, 3) : null,
    };
  }

  function handlePitchAction(action, pitchType) {
    if (!action) return;

    void logEvent("pitch_clicked", { sessionId, leadId, pitch: pitchType || null, action });

    switch (action) {
      case "BOOK_CONSULTATION":
      case "PRIORITY_BOOKING":
      case "INSURANCE_CONSULT": {
        const msg = encodeURIComponent(
          action === "PRIORITY_BOOKING"
            ? "I want to schedule a priority consultation"
            : action === "INSURANCE_CONSULT"
              ? "I want a free insurance needs analysis"
              : "I want to book a free consultation"
        );
        const href = whatsappHref || `https://wa.me/918850977259?text=${msg}`;
        window.open(href, "_blank", "noopener,noreferrer");
        break;
      }
      case "OPEN_CALCULATOR":
      case "OPEN_RETIREMENT_PLANNER":
      case "OPEN_TAX_CALC": {
        // Keep a working route even if specific tools are added later.
        window.location.href = "/sip-calculator";
        break;
      }
      case "SHOW_PLATFORMS": {
        // Platform buttons are rendered separately below the bot message.
        break;
      }
      case "DOWNLOAD_GUIDE": {
        // No download flow implemented yet; route to consultation.
        const href = whatsappHref || "https://wa.me/918850977259?text=I%20want%20the%20beginner%20investing%20guide";
        window.open(href, "_blank", "noopener,noreferrer");
        break;
      }
      default:
        break;
    }
  }

  async function logEvent(event_type, data = {}) {
    try {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: leadId || undefined, event_type, data }),
      });
    } catch {
      // ignore
    }
  }

  async function addRevenue() {
    if (!admin) return;
    const raw = String(revenueAmount || "").trim();
    const cleaned = raw.replace(/[,\s]/g, "");
    const amount = Number(cleaned);
    if (!Number.isFinite(amount) || amount <= 0) {
      setRevenueErr("Enter a valid amount.");
      return;
    }
    setRevenueErr("");
    setRevenueBusy(true);
    try {
      const r = await fetch("/api/admin/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          source: revenueSource,
          note: String(revenueNote || "").trim() || undefined,
        }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) {
        setRevenueErr(j?.error === "setup_required" ? "Revenue tracking not configured." : "Could not save.");
        return;
      }
      setRevenueAmount("");
      setRevenueSource("Other");
      setRevenueNote("");
      setRevenueModalOpen(false);
      const dash = await refreshDashboard();
      setDashboard(dash);
    } finally {
      setRevenueBusy(false);
    }
  }

  async function send() {
    if (!enabled || !open) return;
    const raw = inputRef.current?.value ?? input;
    const text = String(raw || "").trim();
    if (!text || busy) return;

    // Family admin unlock (password typed into chat) — do this BEFORE we push user text into the chat.
    // We only attempt when it looks like a 4-digit family PIN (avoids extra calls on normal messages).
    if (!admin && !familyAdmin && /^\d{4}$/.test(text)) {
      // Keep DOM + state in sync
      if (inputRef.current) inputRef.current.value = "";
      setInput("");
      setBusy(true);
      try {
        const res = await tryFamilyLogin(text);
        if (res?.setupRequired) {
          pushBotUser("Family dashboard is not configured on this environment yet.");
          return;
        }
        if (res?.ok) {
          setFamilyAdmin(true);
          setTab("family");
          pushBotUser("Welcome BM Wealth! \u{1F4CA} Viewing family dashboard...");
          return;
        }
      } finally {
        setBusy(false);
      }
      pushBotUser("Family code not recognized.");
      return;
    }
    // Super admin unlock (redirect to hidden control panel) - intercept before echo
    // Trigger only for password-like inputs (contains '@') to avoid catching normal chat.
    if (!admin && !familyAdmin && !(captureStep === "email" && isValidEmail(text)) && text.includes("@") && text.length <= 64) {
      if (inputRef.current) inputRef.current.value = "";
      setInput("");
      setBusy(true);
      try {
        const res = await tryAdminLogin(text);
        if (res?.setupRequired) {
          pushBotUser("Super admin is not configured on this environment yet.");
          return;
        }
        if (res?.ok) {
          pushBotUser("Welcome. \u{1F39B}\u{FE0F} Redirecting to control panel...");
          setTimeout(() => {
            window.location.href = "/admin-secret-akash";
          }, 250);
          return;
        }
        pushBotUser("Super admin code not recognized.");
        return;
      } finally {
        setBusy(false);
      }
    }

    const conversationHistory = buildConversationHistorySnapshot();

    // Keep DOM + state in sync (robust to automation + IME edge-cases)
    if (inputRef.current) inputRef.current.value = "";
    setInput("");
    if (admin) pushUserAdmin(text);
    else pushUserUser(text);
    setBusy(true);

    try {
      // Analytics: conversation started (once per session, on first real user message)
      if (!convoStartedRef.current) {
        convoStartedRef.current = true;
        void logEvent("conversation_started", { sessionId });
      }
      // Analytics: message sent
      void logEvent("message_sent", { sessionId, admin, chars: text.length });

      // allow leaving admin mode quickly
      if (admin && /^(exit|leave|logout)$/i.test(text)) {
        exitAdminMode();
        return;
      }

      // Human handoff request (show WhatsApp option only when asked)
      if (wantsHuman(text)) {
        setHumanReady(true);
        if (admin) pushBotAdmin("Sure - you can contact our customer support team on WhatsApp.");
        else pushBotUser("Sure - you can contact our customer support team on WhatsApp.");
        return;
      }

      // Lead capture gate (Micro-MVP)
      // IMPORTANT: never run lead capture in admin mode.
      if (!admin && !familyAdmin && FEATURE_LEAD_CAPTURE && captureStep !== "done") {
        if (captureStep === "name") {
          if (isGreetingOnly(text)) {
            pushBotUser("Hello. May I have your name?");
            return;
          }
          setLeadDraft((p) => ({ ...p, name: text }));
          setCaptureStep("email");
          pushBotUser("Thank you. Please share your email.");
          return;
        }

        if (captureStep === "email") {
          if (!isValidEmail(text)) {
            pushBotUser("Please enter a valid email (example: name@email.com).");
            return;
          }
          setLeadDraft((p) => ({ ...p, email: text.trim().toLowerCase() }));
          setCaptureStep("phone");
          pushBotUser("Perfect. Your mobile number?");
          return;
        }

        if (captureStep === "phone") {
          const phone = normalizePhone(text);
          if (!phone) {
            pushBotUser("Please enter a valid phone number (10 digits).");
            return;
          }
          const nextDraft = { ...leadDraft, phone };
          setLeadDraft(nextDraft);
          const res = await upsertLead(nextDraft);
          const lead = res?.lead;
          if (lead?.id) {
            setLeadId(lead.id);
            setCaptureStep("done");
            void logEvent("lead_captured", { sessionId, leadId: lead.id });
            pushBotUser("Done. How can I help you today?");
          } else if (res?.setupRequired) {
            setCaptureStep("done");
            pushBotUser(
              "Thanks. Concierge is available now. Lead capture is not configured on this environment yet, so details may not be saved.\n" +
                (res?.hint ? `\nSetup hint: ${res.hint}\n` : "\n") +
                "Admin can check: /api/health"
            );
          } else {
            pushBotUser("Setup is still in progress. Please try again in a moment.");
          }
          return;
        }
      }

      // Simple greeting handling (keeps chat clean, avoids models echoing old context)
      if (captureStep === "done" && !admin && isGreetingOnly(text)) {
        pushBotUser("Hello. How can I help you today?");
        return;
      }

      // Normal chat
      const { reply, cta, affiliatePlatforms, pitch, pitchType, suggestions } = await sendChat({
        message: text,
        mode: admin ? "admin" : "user",
        leadId,
        conversationHistory,
      });

      const extra = {};
      if (cta) extra.cta = cta;
      if (!admin && pitch && pitchType) {
        extra.pitch = pitch;
        extra.pitchType = pitchType;
        // Track pitch state locally to avoid over-pitching.
        const nextLen = (conversationHistory?.length || 0) + 1;
        pitchStateRef.current = {
          lastPitchAt: nextLen,
          seenPitches: Array.from(new Set([...(pitchStateRef.current.seenPitches || []), pitchType])).slice(0, 30),
        };
      }
      if (!admin && Array.isArray(affiliatePlatforms) && affiliatePlatforms.length) {
        extra.affiliatePlatforms = affiliatePlatforms;
      }

      if (!admin && Array.isArray(suggestions) && suggestions.length) {
        extra.suggestions = suggestions;
      }

      if (admin) pushBotAdmin(reply, Object.keys(extra).length ? extra : null);
      else pushBotUser(reply, Object.keys(extra).length ? extra : null);
      void logEvent("chat_message", { sessionId, admin, chars: text.length });

      // Dashboard auto-refresh when in admin
      if (admin && tab === "dashboard") {
        const dash = await refreshDashboard();
        setDashboard(dash);
      }
    } finally {
      setBusy(false);
    }
  }

  // IMPORTANT: don't early-return before hooks; it breaks hook ordering when `open` toggles.
  if (!enabled) return null;
  if (!open) return null;

  return (
    <>
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <button className={styles.dismiss} aria-label="Close" onClick={onClose} />

        <div className={styles.panel}>
          <div className={styles.scanline} />

          <div className={styles.header}>
            <div className={styles.brand}>
              <div className={styles.badge}>{admin ? "SYSTEM CORE" : "CONCIERGE"}</div>
              <div className={styles.title}>BM Wealth - Concierge</div>
            </div>

            <div className={styles.actions}>
              {admin && (
                <>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    aria-label={tab === "dashboard" ? "Open chat" : "Open dashboard"}
                    onClick={async () => {
                      if (tab === "chat") {
                        setTab("dashboard");
                        const dash = await refreshDashboard();
                        setDashboard(dash);
                      } else {
                        setTab("chat");
                      }
                    }}
                  >
                    {tab === "dashboard" ? "CHAT" : "DASH"}
                  </button>
                  {FEATURE_ANALYTICS ? (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      aria-label={tab === "analytics" ? "Open dashboard" : "Open analytics"}
                      onClick={async () => {
                        if (tab === "analytics") {
                          setTab("dashboard");
                          const dash = await refreshDashboard();
                          setDashboard(dash);
                          return;
                        }
                        setTab("analytics");
                        const a = await fetchAnalytics();
                        setAnalytics(a);
                      }}
                    >
                      {tab === "analytics" ? "DASH" : "ANL"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.actionBtn}
                    aria-label="Exit admin mode"
                    onClick={() => exitAdminMode()}
                  >
                    EXIT
                  </button>
                </>
              )}
              {!admin && familyAdmin && (
                <>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    aria-label="Exit family admin mode"
                    onClick={() => void exitFamilyAdminMode()}
                  >
                    EXIT
                  </button>
                </>
              )}

              <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
                <svg
                  className={styles.closeX}
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                >
                  <path d="M4 4L14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14 4L4 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {admin && tab === "analytics" && FEATURE_ANALYTICS ? (
            <div className={styles.body}>
              <div className={styles.bubble}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Analytics
                  </div>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={async () => {
                      const a = await fetchAnalytics();
                      setAnalytics(a);
                    }}
                    aria-label="Refresh analytics"
                    title="Refresh"
                    style={{ width: 64 }}
                  >
                    REF
                  </button>
                </div>
                {analyticsBusy ? <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>Loading…</div> : null}
              </div>

              {analytics ? (
                <>
                  <div className={styles.bubble}>
                    <div className={styles.sectionTitle}>Today</div>
                    <div className={styles.statGrid}>
                      <StatCard label="Visitors" value={analytics?.today?.visitors ?? 0} />
                      <StatCard label="Conversations" value={analytics?.today?.conversations_started ?? 0} />
                      <StatCard label="Leads" value={analytics?.today?.leads_captured ?? 0} />
                      <StatCard
                        label="Conversion"
                        value={`${analytics?.today?.conversion_rate ?? 0}%`}
                        sub="leads / visitors"
                      />
                      <StatCard
                        label="Avg msgs / convo"
                        value={analytics?.today?.avg_messages_per_conversation ?? 0}
                      />
                    </div>
                  </div>

                  <div className={styles.bubble}>
                    <div className={styles.sectionTitle}>This Week</div>
                    <div className={styles.statGrid}>
                      <StatCard label="Visitors" value={analytics?.week?.visitors ?? 0} />
                      <StatCard label="Leads" value={analytics?.week?.leads ?? 0} />
                      <div className={styles.statCardWide}>
                        <div className={styles.statLabel}>HOT / WARM / COLD</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                          <MiniDonut
                            hot={analytics?.week?.tier_breakdown?.HOT ?? 0}
                            warm={analytics?.week?.tier_breakdown?.WARM ?? 0}
                            cold={analytics?.week?.tier_breakdown?.COLD ?? 0}
                          />
                          <div style={{ display: "grid", gap: 6, fontSize: 12, opacity: 0.85 }}>
                            <div>HOT: {analytics?.week?.tier_breakdown?.HOT ?? 0}</div>
                            <div>WARM: {analytics?.week?.tier_breakdown?.WARM ?? 0}</div>
                            <div>COLD: {analytics?.week?.tier_breakdown?.COLD ?? 0}</div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.statCardWide}>
                        <div className={styles.statLabel}>Trend (7d)</div>
                        <MiniLine data={analytics?.week?.daily || []} aKey="leads" bKey="visitors" />
                        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.65 }}>
                          Gold = leads, Silver = visitors
                        </div>
                      </div>
                      <div className={styles.statCardWide}>
                        <div className={styles.statLabel}>Top Questions</div>
                        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                          {(analytics?.week?.top_questions || []).slice(0, 5).map((q) => (
                            <div key={q.question} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                              <div style={{ opacity: 0.9, fontSize: 12, lineHeight: 1.35 }}>{q.question}</div>
                              <div className={styles.mono} style={{ opacity: 0.75 }}>{q.count}</div>
                            </div>
                          ))}
                          {(analytics?.week?.top_questions || []).length === 0 ? (
                            <div style={{ opacity: 0.6, fontSize: 12 }}>No questions captured yet.</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.bubble}>
                    <div className={styles.sectionTitle}>This Month</div>
                    <div className={styles.statGrid}>
                      <StatCard
                        label="Visitors"
                        value={analytics?.month?.visitors ?? 0}
                        sub={`vs last month: ${analytics?.month?.visitors_growth_pct ?? 0}%`}
                      />
                      <StatCard
                        label="Revenue"
                        value={fmtINR(analytics?.month?.revenue ?? 0)}
                        sub={`vs last month: ${analytics?.month?.revenue_growth_pct ?? 0}%`}
                      />
                      <StatCard
                        label="Most active hour (IST)"
                        value={`${String(analytics?.month?.most_active_hour_ist ?? 0).padStart(2, "0")}:00`}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.bubble}>
                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    Analytics not available yet. Try refresh.
                  </div>
                </div>
              )}
            </div>
                    ) : tab === "family" && familyAdmin ? (
            <div className={styles.body}>
              <div
                className={styles.bubble}
                style={{
                  padding: 0,
                  width: "100%",
                  maxWidth: "100%",
                  alignSelf: "stretch",
                  overflow: "hidden",
                }}
              >
                <FamilyAdminView onExit={exitFamilyAdminMode} />
              </div>
            </div>
          ) : tab === "dashboard" && admin ? (
            <div className={styles.body}>
              <div className={styles.bubble}>
                <div style={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Today
                </div>
                <div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: "0.12em" }}>LEADS</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(192,160,98,0.95)" }}>
                      {dashboard?.today?.leads?.length ?? 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: "0.12em" }}>CHATS</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(192,160,98,0.95)" }}>
                      {dashboard?.today?.conversations?.length ?? 0}
                    </div>
                  </div>
                    {FEATURE_REVENUE_TRACKING ? (
                      <div>
                        <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: "0.12em" }}>REVENUE TODAY</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(192,160,98,0.95)" }}>
                          {fmtINR(dashboard?.today?.revenue_today ?? 0)}
                        </div>
                      </div>
                    ) : null}
                </div>
                {FEATURE_REVENUE_TRACKING ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap", opacity: 0.85 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                      THIS WEEK{" "}
                      <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                        {fmtINR(dashboard?.today?.revenue_week ?? 0)}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                      THIS MONTH{" "}
                      <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                        {fmtINR(dashboard?.today?.revenue_month ?? 0)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        setRevenueErr("");
                        setRevenueModalOpen(true);
                      }}
                      aria-label="Add revenue"
                      title="Add Revenue"
                      style={{ width: 110 }}
                    >
                      ADD REV
                    </button>
                  </div>
                ) : null}
                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", opacity: 0.85 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    TOTAL LEADS{" "}
                    <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                      {dashboard?.all?.total_leads ?? dashboard?.all?.leads?.length ?? 0}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    NEW TODAY{" "}
                    <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                      {dashboard?.all?.new_today ?? 0}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    CONVERSATIONS{" "}
                    <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                      {dashboard?.all?.total_conversations_today ?? dashboard?.today?.conversations?.length ?? 0}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.85 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    HOT <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>{dashboard?.today?.lead_score_counts?.HOT ?? 0}</span>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    WARM <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>{dashboard?.today?.lead_score_counts?.WARM ?? 0}</span>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    COLD <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>{dashboard?.today?.lead_score_counts?.COLD ?? 0}</span>
                  </div>
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", opacity: 0.8 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    AI GEMINI{" "}
                    <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                      {dashboard?.today?.ai_provider_counts?.gemini ?? 0}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em" }}>
                    AI GROQ{" "}
                    <span style={{ color: "rgba(192,160,98,0.95)", fontWeight: 900 }}>
                      {dashboard?.today?.ai_provider_counts?.groq ?? 0}
                    </span>
                  </div>
                </div>

                {revenueErr ? (
                  <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,120,120,0.95)" }}>{revenueErr}</div>
                ) : null}
              </div>

              {FEATURE_CLAUDE_ADMIN ? (
                <div className={styles.bubble}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      Today’s strategic advice
                    </div>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={async () => {
                        const s = await fetchStrategy({ force: true });
                        setStrategy(s);
                      }}
                      aria-label="Refresh strategic advice"
                      title="Refresh"
                      style={{ width: 64 }}
                      disabled={strategyBusy}
                    >
                      {strategyBusy ? "…" : "REF"}
                    </button>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", opacity: 0.9 }}>
                    {strategy?.text ? strategy.text : "No advice generated yet. Tap REF."}
                  </div>
                  {strategy?.cached ? (
                    <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>Cached for today.</div>
                  ) : null}
                </div>
              ) : (
                <div className={styles.bubble}>
                  <div style={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Strategic advice
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                    Disabled by feature flag.
                  </div>
                </div>
              )}

              <div className={styles.bubble}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    Leads
                  </div>
                  <div className={styles.exportBar}>
                    <select
                      className={styles.exportSelect}
                      value={exportFilter}
                      onChange={(e) => setExportFilter(e.target.value)}
                      aria-label="Export filter"
                    >
                      <option value="all">All</option>
                      <option value="hot">HOT only</option>
                      <option value="today">Today</option>
                    </select>
                    <button
                      type="button"
                      className={styles.exportBtn}
                      onClick={() => void exportLeads()}
                      disabled={exportBusy}
                      aria-label="Export leads"
                      title="Export Leads"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M12 3v10m0 0 4-4m-4 4-4-4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className={styles.exportBtnText}>{exportBusy ? "Exporting…" : "Export"}</span>
                    </button>
                  </div>
                </div>
                {exportNote ? <div className={styles.exportNote}>{exportNote}</div> : null}

                <div className={styles.adminTableWrap}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboard?.all?.leads || []).map((l) => (
                        <tr
                          key={l.id}
                          className={[
                            selectedLeadId === l.id ? styles.adminRowActive : "",
                            (dashboard?.today?.lead_scores?.[l.id]?.tier || "") === "HOT" ? styles.rowHot : "",
                            (dashboard?.today?.lead_scores?.[l.id]?.tier || "") === "WARM" ? styles.rowWarm : "",
                            (dashboard?.today?.lead_scores?.[l.id]?.tier || "") === "COLD" ? styles.rowCold : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={async () => {
                            setSelectedLeadId(l.id);
                            setLeadDetail(null);
                            const d = await fetchLeadDetail(l.id);
                            setLeadDetail(d);
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <td>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                              <span>{l.name || "Anonymous"}</span>
                              <span className={styles.scorePill}>
                                {(dashboard?.today?.lead_scores?.[l.id]?.tier || "COLD")}{" "}
                                {Number.isFinite(Number(dashboard?.today?.lead_scores?.[l.id]?.score))
                                  ? `• ${Number(dashboard?.today?.lead_scores?.[l.id]?.score)}`
                                  : ""}
                              </span>
                            </div>
                          </td>
                          <td className={styles.mono}>{l.email || "—"}</td>
                          <td className={styles.mono}>{l.phone || "—"}</td>
                          <td className={styles.mono}>{fmtDateTime(l.created_at)}</td>
                        </tr>
                      ))}
                      {(!dashboard?.all?.leads || dashboard.all.leads.length === 0) ? (
                        <tr>
                          <td colSpan={4} style={{ opacity: 0.6, padding: "12px 10px" }}>
                            No leads yet.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedLeadId ? (
                <div className={styles.bubble}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      Conversation
                    </div>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => {
                        setSelectedLeadId(null);
                        setLeadDetail(null);
                      }}
                      aria-label="Close conversation"
                      title="Close"
                    >
                      CLOSE
                    </button>
                  </div>

                  {leadDetailBusy ? (
                    <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>Loading…</div>
                  ) : null}

                  {!leadDetailBusy && leadDetail?.lead ? (
                    <div style={{ marginTop: 10, opacity: 0.8, fontSize: 12, lineHeight: 1.5 }}>
                      <div><span style={{ opacity: 0.6 }}>Name:</span> {leadDetail.lead.name || "Anonymous"}</div>
                      <div><span style={{ opacity: 0.6 }}>Email:</span> {leadDetail.lead.email || "—"}</div>
                      <div><span style={{ opacity: 0.6 }}>Phone:</span> {leadDetail.lead.phone || "—"}</div>
                      <div><span style={{ opacity: 0.6 }}>Captured:</span> {fmtDateTime(leadDetail.lead.created_at)}</div>
                    </div>
                  ) : null}

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {(leadDetail?.conversations || []).map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: c.sender === "user" ? "rgba(255,255,255,0.04)" : "rgba(192,160,98,0.06)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, opacity: 0.7, fontSize: 11 }}>
                          <span style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}>{c.sender}</span>
                          <span className={styles.mono}>{fmtDateTime(c.created_at)}</span>
                        </div>
                        <div style={{ marginTop: 6, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.45 }}>
                          {c.message}
                        </div>
                      </div>
                    ))}
                    {leadDetail && (leadDetail?.conversations || []).length === 0 ? (
                      <div style={{ opacity: 0.6, fontSize: 12 }}>No conversations for this lead yet.</div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {FEATURE_REVENUE_TRACKING && revenueModalOpen ? (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                  <div className={styles.modalCard}>
                    <div className={styles.modalTitle}>Add Revenue</div>
                    <div className={styles.modalSub}>Revenue Today • Manual entry</div>

                    <label className={styles.modalLabel}>Amount (₹)</label>
                    <input
                      className={styles.modalInput}
                      value={revenueAmount}
                      onChange={(e) => {
                        setRevenueAmount(e.target.value);
                        if (revenueErr) setRevenueErr("");
                      }}
                      inputMode="decimal"
                      placeholder="e.g., 25000"
                    />

                    <label className={styles.modalLabel}>Source</label>
                    <select
                      className={styles.modalInput}
                      value={revenueSource}
                      onChange={(e) => setRevenueSource(e.target.value)}
                    >
                      <option value="Affiliate">Affiliate</option>
                      <option value="Lead Sale">Lead Sale</option>
                      <option value="Product">Product</option>
                      <option value="Other">Other</option>
                    </select>

                    <label className={styles.modalLabel}>Note (optional)</label>
                    <textarea
                      className={styles.modalTextarea}
                      value={revenueNote}
                      onChange={(e) => setRevenueNote(e.target.value)}
                      placeholder="Short note for your records…"
                      rows={3}
                    />

                    {revenueErr ? <div className={styles.modalError}>{revenueErr}</div> : null}

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        className={styles.modalBtn}
                        onClick={() => {
                          if (revenueBusy) return;
                          setRevenueModalOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.modalBtnPrimary}
                        disabled={revenueBusy}
                        onClick={() => void addRevenue()}
                      >
                        {revenueBusy ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div ref={listRef} className={styles.body}>
                {activeMessages.map((m) => {
                  const ctaHref = m?.cta?.href || whatsappHref;
                  const ctaExternal = /^https?:\/\//i.test(String(ctaHref || ""));

                  return (
                    <div
                      key={m.id}
                      className={[
                        styles.bubble,
                        m.sender === "user" ? styles.bubbleUser : styles.bubbleBot,
                      ].join(" ")}
                    >
                      {m.text}
                      {m?.cta?.label && ctaHref ? (
                        <a
                          className={styles.consultCta}
                          href={ctaHref}
                          target={ctaExternal ? "_blank" : undefined}
                          rel={ctaExternal ? "noopener noreferrer" : undefined}
                          onClick={() => void logEvent("consultation_click", { sessionId, leadId })}
                        >
                          {m.cta.label}
                        </a>
                      ) : null}

                    {Array.isArray(m?.affiliatePlatforms) && m.affiliatePlatforms.length ? (
                      <div className={styles.platformOptions}>
                        <div className={styles.platformTitle}>Explore these popular platforms:</div>
                        <div className={styles.platformButtons}>
                          {m.affiliatePlatforms.map((p) => (
                            <a
                              key={p}
                              href={createTrackedLink(p, leadId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.platformBtn}
                              onClick={() => void logClick(p, leadId)}
                            >
                              Open {p} →
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {Array.isArray(m?.suggestions) && m.suggestions.length ? (
                      <div className={styles.suggestionsWrap}>
                        <div className={styles.suggestionsTitle}>Quick suggestions:</div>
                        <div className={styles.suggestionsButtons}>
                          {m.suggestions.map((s, idx) => (
                            <button
                              key={`${idx}-${s}`}
                              type="button"
                              className={styles.suggestionBtn}
                              onClick={() => {
                                if (busy) return;
                                if (inputRef.current) inputRef.current.value = String(s || "");
                                setInput(String(s || ""));
                                void send();
                              }}
                            >
                              {String(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {m?.pitch?.message && m?.pitch?.cta && m?.pitch?.action ? (
                      <div
                        className={[
                          styles.pitchCard,
                          m?.pitch?.priority === "urgent"
                            ? styles.pitchUrgent
                            : m?.pitch?.priority === "high"
                              ? styles.pitchHigh
                              : m?.pitch?.priority === "medium"
                                ? styles.pitchMedium
                                : styles.pitchLow,
                        ].join(" ")}
                      >
                        <div className={styles.pitchContent}>
                          <ReactMarkdown>{String(m.pitch.message || "")}</ReactMarkdown>
                        </div>
                        <button
                          type="button"
                          className={styles.pitchCta}
                          onClick={() => handlePitchAction(m.pitch.action, m.pitchType)}
                        >
                          {String(m.pitch.cta)} →
                        </button>
                      </div>
                    ) : null}
                    </div>
                  );
                })}

                {humanReady && whatsappHref ? (
                  <a
                    className={styles.humanCta}
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => void logEvent("whatsapp_click", { sessionId })}
                  >
                    Contact Support on WhatsApp
                  </a>
                ) : null}

                {busy && (
                  <div className={[styles.bubble, styles.bubbleBot].join(" ")}>
                    <span className={styles.typing} aria-label="Typing">
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.inputBar}>
                <input
                  className={styles.input}
                  ref={inputRef}
                  value={input}
                  placeholder={admin ? "Admin command..." : "Type your message..."}
                  onChange={(e) => setInput(e.target.value)}
                  onInput={(e) => setInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  disabled={busy}
                />
                <button className={styles.send} type="button" onClick={() => void send()} disabled={busy}>
                  SEND
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}























