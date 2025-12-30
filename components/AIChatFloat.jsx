'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AIChatFloat.module.css";

const COMPLIANCE_TEXT =
  "Welcome to BM Wealth. We provide educational guidance and product \n" +
  "distribution services. AMFI Registered â€¢ IRDAI Licensed â€¢ \n" +
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

export default function AIChatFloat({ open, onClose, whatsappHref }) {
  // Safety: keep it OFF unless explicitly enabled via env flag.
  const flag = process.env.NEXT_PUBLIC_AI_CHAT_ENABLED;
  const enabled = flag ? flag === "true" : true;
  if (!enabled) return null;
  if (!open) return null;

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [leadDraft, setLeadDraft] = useState({ name: "", email: "", phone: "" });
  const [captureStep, setCaptureStep] = useState("name"); // name|email|phone|done
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState("chat"); // chat|dashboard
  const [humanReady, setHumanReady] = useState(false);

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
        "Welcome to BM Wealth.\n\nTo provide a premium experience, may I have your name?",
    },
  ]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length, busy]);

  function pushBot(text) {
    setMessages((prev) => [
      ...prev,
      { id: "b_" + Date.now().toString(16), sender: "bot", at: todayISO(), text: String(text || "") },
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
    if (!r.ok) return false;
    const j = await r.json().catch(() => null);
    return Boolean(j?.ok);
  }

  async function refreshDashboard() {
    const r = await fetch("/api/admin/summary", { method: "GET" });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    return j?.ok ? j : null;
  }

  async function upsertLead({ name, email, phone }) {
    const r = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) return null;
    return j.lead;
  }

  async function sendChat({ message, mode, leadId: lid }) {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, mode, leadId: lid || undefined }),
    });
    const j = await r.json().catch(() => null);
    if (!j?.ok) return { reply: "Temporary issue. Please try again.", warn: "bad_response" };
    return { reply: j.reply || "", warn: j.warn };
  }

  async function logEvent(event_type, data = {}) {
    // Only log once we have a valid leadId (API requires UUID)
    if (!leadId) return;
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, event_type, data }),
      });
    } catch {
      // ignore
    }
  }

  async function send() {
    const raw = inputRef.current?.value ?? input;
    const text = String(raw || "").trim();
    if (!text || busy) return;

    // Keep DOM + state in sync (robust to automation + IME edge-cases)
    if (inputRef.current) inputRef.current.value = "";
    setInput("");
    pushUser(text);
    setBusy(true);

    try {
      // Human handoff request (show WhatsApp option only when asked)
      if (wantsHuman(text)) {
        setHumanReady(true);
        pushBot("Sure â€” you can contact our customer support team on WhatsApp.");
        return;
      }

      // Admin unlock (user types password in chat)
      if (!admin) {
        const ok = await tryAdminLogin(text);
        if (ok) {
          setAdmin(true);
          setTab("dashboard");
          pushBot("Admin mode unlocked.");
          const dash = await refreshDashboard();
          setDashboard(dash);
          return;
        }
      }

      // Lead capture gate (Microâ€‘MVP)
      if (captureStep !== "done") {
        if (captureStep === "name") {
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
          const lead = await upsertLead(nextDraft);
          if (lead?.id) {
            setLeadId(lead.id);
            setCaptureStep("done");
            pushBot("Done. How can I help you today?");
          } else {
            pushBot("Setup is still in progress. Please try again in a moment.");
          }
          return;
        }
      }

      // Normal chat
      const { reply } = await sendChat({ message: text, mode: admin ? "admin" : "user", leadId });
      pushBot(reply);
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

  return (
    <>
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <button className={styles.dismiss} aria-label="Close" onClick={onClose} />

        <div className={styles.panel}>
          <div className={styles.scanline} />

          <div className={styles.header}>
            <div className={styles.brand}>
              <div className={styles.badge}>{admin ? "SYSTEM CORE" : "CONCIERGE"}</div>
              <div className={styles.title}>BM Wealth â€” Concierge</div>
              <div className={styles.compliance}>{COMPLIANCE_TEXT}</div>
            </div>

            <div className={styles.actions}>
              {admin && (
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
              )}

              <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
                <span className={styles.closeX} aria-hidden="true">Ã—</span>
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
                </div>
              </div>

              {(dashboard?.today?.leads || []).slice(0, 30).map((l) => (
                <div key={l.id} className={styles.bubble}>
                  <div style={{ fontWeight: 750 }}>{l.name || "Anonymous"}</div>
                  <div style={{ marginTop: 4, opacity: 0.65, fontSize: 12 }}>{l.email}</div>
                  <div style={{ marginTop: 6, opacity: 0.95, fontSize: 13 }}>{l.phone}</div>
                </div>
              ))}
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
                  </div>
                ))}

                {humanReady && whatsappHref ? (
                  <a className={styles.humanCta} href={whatsappHref} target="_blank" rel="noopener noreferrer">
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
                  placeholder={admin ? "Admin commandâ€¦" : "Type your messageâ€¦"}
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



