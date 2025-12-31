'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AIChatFloat.module.css";

const COMPLIANCE_TEXT =
  "Welcome to BM Wealth. We provide educational guidance and product\n" +
  "distribution services. AMFI Registered | IRDAI Licensed |\n" +
  "Investments subject to market dynamics.";

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
  const [leadId, setLeadId] = useState(null);
  const [leadDraft, setLeadDraft] = useState({ name: "", email: "", phone: "" });
  const [captureStep, setCaptureStep] = useState("name"); // name|email|phone|done
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState("chat"); // chat|dashboard
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

  function exitAdminMode() {
    setAdmin(false);
    setTab("chat");
    setDashboard(null);
    setSelectedLeadId(null);
    setLeadDetail(null);
    pushBot("Exited admin mode.");
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
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      id: "m0",
      sender: "bot",
      at: todayISO(),
      text:
        `${dayGreeting()}\n\n${COMPLIANCE_TEXT}\n\nTo provide a premium experience, may I have your name?`,
    },
  ]);

  useEffect(() => {
    if (!enabled || !open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [enabled, open, messages.length, busy]);

  function pushBot(text, extra = null) {
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

  function pushUser(text) {
    setMessages((prev) => [
      ...prev,
      { id: "u_" + Date.now().toString(16), sender: "user", at: todayISO(), text: String(text || "") },
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
      return (messages || [])
        // Exclude the initial compliance/onboarding message so models don't echo it back.
        .filter((m) => {
          if (!m || m.id === "m0") return false;
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
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode,
        leadId: lid || undefined,
        conversationId: sessionId,
        conversationHistory: conversationHistory || undefined,
      }),
    });
    const j = await r.json().catch(() => null);
    if (r.status === 429 || j?.error === "rate_limited") {
      return {
        reply: "Just a moment — please send up to 10 messages per minute so we can keep the concierge experience smooth.",
        warn: "rate_limited",
      };
    }
    if (!r.ok || !j?.ok) return { reply: "Temporary issue. Please try again.", warn: j?.error || "bad_response" };
    return {
      reply: j.reply || "",
      warn: j.warn,
      cta: j.cta || null,
      intent: j.intent || null,
    };
  }

  async function logEvent(event_type, data = {}) {
    try {
      await fetch("/api/events", {
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

    const conversationHistory = buildConversationHistorySnapshot();

    // Keep DOM + state in sync (robust to automation + IME edge-cases)
    if (inputRef.current) inputRef.current.value = "";
    setInput("");
    pushUser(text);
    setBusy(true);

    try {
      // allow leaving admin mode quickly
      if (admin && /^(exit|leave|logout)$/i.test(text)) {
        exitAdminMode();
        return;
      }

      // Human handoff request (show WhatsApp option only when asked)
      if (wantsHuman(text)) {
        setHumanReady(true);
        pushBot("Sure - you can contact our customer support team on WhatsApp.");
        return;
      }

      // Admin unlock (enter password-like digits to unlock)
      // IMPORTANT: avoid intercepting phone capture (10-digit numbers).
      // Allow 4-digit PIN anytime (admin convenience), but longer numeric inputs only after capture is done.
      if (!admin && (/^\d{4}$/.test(text) || (captureStep === "done" && /^\d{5,12}$/.test(text)))) {
        const res = await tryAdminLogin(text);
        if (res?.setupRequired) {
          pushBot("Admin dashboard is not configured on this environment yet.");
          return;
        }
        if (res?.ok) {
          setAdmin(true);
          setTab("dashboard");
          pushBot("Admin mode unlocked.");
          const dash = await refreshDashboard();
          setDashboard(dash);
          return;
        }
        pushBot("Admin code not recognized for this environment.");
        return;
      }

      // Lead capture gate (Micro-MVP)
      // IMPORTANT: never run lead capture in admin mode.
      if (!admin && captureStep !== "done") {
        if (captureStep === "name") {
          if (isGreetingOnly(text)) {
            pushBot("Hello. May I have your name?");
            return;
          }
          setLeadDraft((p) => ({ ...p, name: text }));
          setCaptureStep("email");
          pushBot("Thank you. Please share your email.");
          return;
        }

        if (captureStep === "email") {
          if (!isValidEmail(text)) {
            pushBot("Please enter a valid email (example: name@email.com).");
            return;
          }
          setLeadDraft((p) => ({ ...p, email: text.trim().toLowerCase() }));
          setCaptureStep("phone");
          pushBot("Perfect. Your mobile number?");
          return;
        }

        if (captureStep === "phone") {
          const phone = normalizePhone(text);
          if (!phone) {
            pushBot("Please enter a valid phone number (10 digits).");
            return;
          }
          const nextDraft = { ...leadDraft, phone };
          setLeadDraft(nextDraft);
          const res = await upsertLead(nextDraft);
          const lead = res?.lead;
          if (lead?.id) {
            setLeadId(lead.id);
            setCaptureStep("done");
            pushBot("Done. How can I help you today?");
          } else if (res?.setupRequired) {
            setCaptureStep("done");
            pushBot(
              "Thanks. Concierge is available now. Lead capture is not configured on this environment yet, so details may not be saved.\n" +
                (res?.hint ? `\nSetup hint: ${res.hint}\n` : "\n") +
                "Admin can check: /api/health"
            );
          } else {
            pushBot("Setup is still in progress. Please try again in a moment.");
          }
          return;
        }
      }

      // Simple greeting handling (keeps chat clean, avoids models echoing old context)
      if (captureStep === "done" && !admin && isGreetingOnly(text)) {
        pushBot("Hello. How can I help you today?");
        return;
      }

      // Normal chat
      const { reply, cta } = await sendChat({
        message: text,
        mode: admin ? "admin" : "user",
        leadId,
        conversationHistory,
      });
      pushBot(reply, cta ? { cta } : null);
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

          {tab === "dashboard" && admin ? (
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
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: "0.12em" }}>REVENUE TODAY</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(192,160,98,0.95)" }}>
                        {fmtINR(dashboard?.today?.revenue_today ?? 0)}
                      </div>
                    </div>
                </div>
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

              {revenueModalOpen ? (
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
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={[
                      styles.bubble,
                      m.sender === "user" ? styles.bubbleUser : styles.bubbleBot,
                    ].join(" ")}
                  >
                    {m.text}
                    {m?.cta?.label && m?.cta?.href ? (
                      <a
                        className={styles.consultCta}
                        href={whatsappHref || m.cta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => void logEvent("consultation_click", { sessionId, leadId })}
                      >
                        {m.cta.label}
                      </a>
                    ) : null}
                  </div>
                ))}

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




