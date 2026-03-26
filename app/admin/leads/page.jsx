"use client";

import { useEffect, useState } from "react";

export default function AdminLeadsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setAuthed(true);
      } else {
        setError(json.error === "locked" ? "Too many attempts. Try again later." : "Invalid password.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch("/api/admin/leads?filter=all", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to fetch leads.");
        if (!cancelled) setLeads(json.leads || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load leads.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authed]);

  const cellStyle = {
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontSize: "13px",
    color: "rgba(235,242,255,0.85)",
    whiteSpace: "nowrap",
  };

  const thStyle = {
    ...cellStyle,
    color: "var(--lux-accent)",
    fontWeight: 600,
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 360, padding: 24 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 300,
              letterSpacing: "1px",
              color: "var(--lux-accent)",
              fontFamily: "'Playfair Display', serif",
              marginBottom: 20,
            }}
          >
            Admin — Leads
          </h1>
          {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Super admin password"
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 0,
              background: "rgba(0,0,0,0.65)",
              color: "rgba(235,242,255,0.92)",
              fontSize: 14,
              outline: "none",
              marginBottom: 14,
            }}
          />
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "12px 0",
              backgroundColor: "var(--lux-accent)",
              color: "#000",
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              opacity: loading || !password ? 0.4 : 1,
            }}
          >
            {loading ? "Checking…" : "Login"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 60px" }}>
        <h1
          style={{
            fontSize: "clamp(22px, 3vw, 34px)",
            fontWeight: 300,
            letterSpacing: "1px",
            fontFamily: "'Playfair Display', serif",
            color: "var(--lux-accent)",
            marginBottom: 24,
          }}
        >
          Leads
        </h1>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {loading && <p style={{ color: "rgba(235,242,255,0.6)", fontSize: 14 }}>Loading…</p>}

        {!loading && leads.length === 0 && !error && (
          <p style={{ color: "rgba(235,242,255,0.5)", fontSize: 14 }}>No leads yet.</p>
        )}

        {leads.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Interest</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td style={cellStyle}>{l.name || "—"}</td>
                    <td style={cellStyle}>{l.email || "—"}</td>
                    <td style={cellStyle}>{l.phone || "—"}</td>
                    <td style={cellStyle}>{l.interest || "—"}</td>
                    <td style={cellStyle}>{l.source || "—"}</td>
                    <td style={cellStyle}>{l.status || "—"}</td>
                    <td style={cellStyle}>
                      {l.created_at
                        ? new Date(l.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
