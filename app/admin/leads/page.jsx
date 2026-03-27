"use client";

import { useEffect, useState, useMemo } from "react";

function formatDateIST(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function isRealLead(source) {
  const s = (source || "").toLowerCase();
  return s === "blueprint" || s === "homepage";
}

function isWithinToday(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const start = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
  const d = new Date(dateStr);
  return d >= start;
}

function isWithinThisWeek(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay() || 7; // Mon=1
  const start = new Date(ist.getFullYear(), ist.getMonth(), ist.getDate() - day + 1);
  const d = new Date(dateStr);
  return d >= start;
}

const SOURCE_OPTIONS = ["All Sources", "blueprint", "homepage", "blog", "other"];
const DATE_OPTIONS = ["All Time", "Today", "This Week"];

export default function AdminLeadsPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [dateFilter, setDateFilter] = useState("All Time");

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

  const filteredLeads = useMemo(() => {
    let list = [...leads];
    // Sort newest first
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    // Source filter
    if (sourceFilter !== "All Sources") {
      if (sourceFilter === "other") {
        list = list.filter((l) => {
          const s = (l.source || "").toLowerCase();
          return s && !["blueprint", "homepage", "blog"].includes(s);
        });
      } else {
        list = list.filter((l) => (l.source || "").toLowerCase() === sourceFilter);
      }
    }
    // Date filter
    if (dateFilter === "Today") list = list.filter((l) => isWithinToday(l.created_at));
    if (dateFilter === "This Week") list = list.filter((l) => isWithinThisWeek(l.created_at));
    return list;
  }, [leads, sourceFilter, dateFilter]);

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

  const filterBarStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
    marginBottom: 20,
  };

  const selectStyle = {
    padding: "8px 12px",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 0,
    background: "rgba(0,0,0,0.65)",
    color: "rgba(235,242,255,0.92)",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
  };

  const dateBtnStyle = (active) => ({
    padding: "8px 14px",
    border: active ? "1px solid var(--lux-accent)" : "1px solid rgba(255,255,255,0.14)",
    borderRadius: 0,
    background: active ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.65)",
    color: active ? "var(--lux-accent)" : "rgba(235,242,255,0.72)",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    letterSpacing: "0.03em",
  });

  const badgeStyle = {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    color: "var(--lux-accent)",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
  };

  const realLeadRowStyle = {
    borderLeft: "2px solid var(--lux-accent)",
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

        {!loading && !error && leads.length > 0 && (
          <>
            {/* Filters */}
            <div style={filterBarStyle}>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                style={selectStyle}
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {DATE_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDateFilter(d)}
                  style={dateBtnStyle(dateFilter === d)}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Lead count */}
            <p style={{ color: "rgba(235,242,255,0.55)", fontSize: 13, marginBottom: 14 }}>
              Showing {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
            </p>
          </>
        )}

        {!loading && leads.length === 0 && !error && (
          <p style={{ color: "rgba(235,242,255,0.5)", fontSize: 14 }}>No leads yet.</p>
        )}

        {filteredLeads.length > 0 && (
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
                {filteredLeads.map((l) => {
                  const real = isRealLead(l.source);
                  return (
                    <tr key={l.id} style={real ? realLeadRowStyle : undefined}>
                      <td style={cellStyle}>{l.name || "—"}</td>
                      <td style={cellStyle}>{l.email || "—"}</td>
                      <td style={cellStyle}>{l.phone || "—"}</td>
                      <td style={cellStyle}>{l.interest || "—"}</td>
                      <td style={cellStyle}>
                        {real ? (
                          <span style={badgeStyle}>{l.source}</span>
                        ) : (
                          l.source || "—"
                        )}
                      </td>
                      <td style={cellStyle}>{l.status || "—"}</td>
                      <td style={cellStyle}>{formatDateIST(l.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
