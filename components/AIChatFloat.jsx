'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Send, ShieldCheck, BarChart3, X } from "lucide-react";

const COMPLIANCE_TEXT =
  "Welcome to BM Wealth. We provide educational guidance and product \n" +
  "distribution services. AMFI Registered • IRDAI Licensed • \n" +
  "Investments subject to market dynamics.";

function uuidLike() {
  // lightweight client id for events; not a UUID, but ok for local correlation
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

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

export default function AIChatFloat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [adminReady, setAdminReady] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [leadDraft, setLeadDraft] = useState({ name: "", email: "", phone: "" });
  const [captureStep, setCaptureStep] = useState("name"); // name|email|phone|done
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState("chat"); // chat|dashboard

  const sessionId = useMemo(() => uuidLike(), []);
  const listRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      id: "m0",
      sender: "bot",
      at: todayISO(),
      text:
        "Hi — I'm BM Wealth AI. I can answer finance questions in an educational way.\n\nBefore we begin, what's your name?",
    },
  ]);

  // Restore session
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bm_ai_chat_state") || "null");
      if (saved?.leadId) setLeadId(saved.leadId);
      if (saved?.captureStep) setCaptureStep(saved.captureStep);
      if (saved?.leadDraft) setLeadDraft(saved.leadDraft);
      if (Array.isArray(saved?.messages) && saved.messages.length) setMessages(saved.messages);
      if (saved?.admin) setAdmin(Boolean(saved.admin));
      if (saved?.adminReady) setAdminReady(Boolean(saved.adminReady));
    } catch {
      // ignore
    }
  }, []);

  // Persist session
  useEffect(() => {
    try {
      localStorage.setItem(
        "bm_ai_chat_state",
        JSON.stringify({ leadId, captureStep, leadDraft, messages, admin, adminReady })
      );
    } catch {
      // ignore
    }
  }, [leadId, captureStep, leadDraft, messages, admin, adminReady]);

  // Auto scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, tab]);

  async function logEvent(event_type, data = {}) {
    if (!leadId) return;
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, event_type, data: { ...data, sessionId } }),
      });
    } catch {
      // ignore
    }
  }

  function pushBot(text) {
    setMessages((m) => [
      ...m,
      { id: uuidLike(), sender: "bot", at: todayISO(), text: String(text || "") },
    ]);
  }

  function pushUser(text) {
    setMessages((m) => [
      ...m,
      { id: uuidLike(), sender: "user", at: todayISO(), text: String(text || "") },
    ]);
  }

  async function handleAdminLogin(password) {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!r.ok) return false;
    const j = await r.json().catch(() => ({}));
    return Boolean(j?.ok);
  }

  async function refreshDashboard() {
    const r = await fetch("/api/admin/summary", { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    return j;
  }

  async function submitLeadIfReady(nextText) {
    // Capture flow (MVP)
    if (captureStep === "done") return true;

    const t = String(nextText || "").trim();
    if (captureStep === "name") {
      setLeadDraft((d) => ({ ...d, name: t }));
      setCaptureStep("email");
      pushBot("Thanks. What's your email?");
      return false;
    }
    if (captureStep === "email") {
      if (!isValidEmail(t)) {
        pushBot("Please share a valid email (example: name@gmail.com).");
        return false;
      }
      setLeadDraft((d) => ({ ...d, email: t.toLowerCase() }));
      setCaptureStep("phone");
      pushBot("Perfect. And your phone number?");
      return false;
    }
    if (captureStep === "phone") {
      const phone = normalizePhone(t);
      if (!phone) {
        pushBot("Please share a valid phone number (10 digits or +country code).");
        return false;
      }
      const finalLead = { ...leadDraft, phone };
      setLeadDraft(finalLead);
      setBusy(true);
      try {
        const r = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalLead),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j?.ok || !j?.lead?.id) {
          pushBot("I couldn't save your details right now. Please try again in a moment.");
          setBusy(false);
          return false;
        }
        setLeadId(j.lead.id);
        setCaptureStep("done");
        pushBot(
          `All set, ${finalLead.name || "there"}. Ask me anything about finance (educational only).\n\n${COMPLIANCE_TEXT}`
        );
        await logEvent("lead_captured", { leadId: j.lead.id, sessionId });
        setBusy(false);
        return true;
      } catch {
        setBusy(false);
        pushBot("I couldn't save your details right now. Please try again.");
        return false;
      }
    }
    return false;
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    pushUser(text);
    await logEvent("message_sent", { sessionId });

    // Admin unlock phrase (must be typed in chat)
    if (!adminReady && text === "Mmaurya@8080") {
      setBusy(true);
      const ok = await handleAdminLogin(text);
      setBusy(false);
      if (ok) {
        setAdmin(true);
        setAdminReady(true);
        setTab("dashboard");
        const dash = await refreshDashboard();
        setDashboard(dash);
        pushBot("Admin mode enabled. Opening dashboard.");
        return;
      }
      pushBot("Admin access failed.");
      return;
    }

    // Lead capture gating
    const ready = await submitLeadIfReady(text);
    if (!ready && captureStep !== "done") return;

    // Normal chat
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, leadId, mode: admin ? "admin" : "user" }),
      });
      const j = await r.json().catch(() => ({}));
      const reply = j?.reply || `I can help with educational guidance.\n\n${COMPLIANCE_TEXT}`;
      pushBot(reply);
    } catch {
      pushBot(`I can help with educational guidance.\n\n${COMPLIANCE_TEXT}`);
    } finally {
      setBusy(false);
    }
  }

  const launcherAria = admin ? "Open BM Wealth Admin AI" : "Open BM Wealth AI Chat";

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        className="bm-ai-float"
        aria-label={launcherAria}
        onClick={() => {
          setOpen(true);
          setTab("chat");
          void logEvent("chat_opened", { sessionId });
        }}
      >
        <div className="bm-ai-float-inner">
          <Sparkles size={26} />
        </div>
      </button>

      {/* Drawer */}
      {open && (
        <div className="bm-ai-overlay" role="dialog" aria-modal="true">
          <button className="bm-ai-overlay-dismiss" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="bm-ai-panel">
            <div className="bm-ai-header">
              <div className="bm-ai-title">
                <div className="bm-ai-badge">
                  {admin ? (
                    <>
                      <ShieldCheck size={16} />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>BM Wealth AI</span>
                    </>
                  )}
                </div>
                <div className="bm-ai-subtitle">{COMPLIANCE_TEXT}</div>
              </div>

              <div className="bm-ai-actions">
                {admin && (
                  <>
                    <button
                      type="button"
                      className={"bm-ai-tab " + (tab === "chat" ? "is-active" : "")}
                      onClick={() => setTab("chat")}
                    >
                      Chat
                    </button>
                    <button
                      type="button"
                      className={"bm-ai-tab " + (tab === "dashboard" ? "is-active" : "")}
                      onClick={async () => {
                        setTab("dashboard");
                        const dash = await refreshDashboard();
                        setDashboard(dash);
                      }}
                    >
                      <BarChart3 size={16} />
                      Dashboard
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="bm-ai-close"
                  aria-label="Close chat"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {tab === "dashboard" && admin ? (
              <div className="bm-ai-dashboard">
                <div className="bm-ai-dashboard-row">
                  <div className="bm-ai-kpi">
                    <div className="bm-ai-kpi-label">Today’s Leads</div>
                    <div className="bm-ai-kpi-value">
                      {dashboard?.today?.leads?.length ?? "—"}
                    </div>
                  </div>
                  <div className="bm-ai-kpi">
                    <div className="bm-ai-kpi-label">Today’s Messages</div>
                    <div className="bm-ai-kpi-value">
                      {dashboard?.today?.conversations?.length ?? "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bm-ai-refresh"
                    onClick={async () => {
                      const dash = await refreshDashboard();
                      setDashboard(dash);
                    }}
                  >
                    Refresh
                  </button>
                </div>

                <div className="bm-ai-dashboard-grid">
                  <div className="bm-ai-card">
                    <div className="bm-ai-card-title">Leads</div>
                    <div className="bm-ai-card-body">
                      {(dashboard?.today?.leads || []).slice(0, 30).map((l) => (
                        <div key={l.id} className="bm-ai-row">
                          <div className="bm-ai-row-main">
                            <div className="bm-ai-row-strong">{l.name || "—"}</div>
                            <div className="bm-ai-row-muted">{l.email || "—"}</div>
                          </div>
                          <div className="bm-ai-row-muted">{l.phone || ""}</div>
                        </div>
                      ))}
                      {(!dashboard?.today?.leads || dashboard.today.leads.length === 0) && (
                        <div className="bm-ai-empty">No leads yet today.</div>
                      )}
                    </div>
                  </div>

                  <div className="bm-ai-card">
                    <div className="bm-ai-card-title">Latest Conversations</div>
                    <div className="bm-ai-card-body">
                      {(dashboard?.today?.conversations || []).slice(0, 40).map((c) => (
                        <div key={c.id} className="bm-ai-row">
                          <div className="bm-ai-row-main">
                            <div className="bm-ai-row-strong">{c.sender}</div>
                            <div className="bm-ai-row-muted">{c.message}</div>
                          </div>
                        </div>
                      ))}
                      {(!dashboard?.today?.conversations ||
                        dashboard.today.conversations.length === 0) && (
                        <div className="bm-ai-empty">No conversations yet today.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div ref={listRef} className="bm-ai-messages" aria-live="polite">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={"bm-ai-bubble " + (m.sender === "user" ? "is-user" : "is-bot")}
                    >
                      <div className="bm-ai-bubble-text">{m.text}</div>
                    </div>
                  ))}
                  {busy && (
                    <div className="bm-ai-bubble is-bot">
                      <div className="bm-ai-typing">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bm-ai-inputbar">
                  <input
                    className="bm-ai-input"
                    value={input}
                    placeholder={admin ? "Ask admin AI…" : "Ask a question…"}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void send();
                    }}
                    disabled={busy}
                  />
                  <button className="bm-ai-send" type="button" onClick={() => void send()} disabled={busy}>
                    <Send size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}


