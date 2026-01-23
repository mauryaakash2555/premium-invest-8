/**
 * Family Admin View
 * Simple stats for family members (read-only)
 * Shows inside chat (not separate page)
 */

"use client";

import { useEffect, useState } from "react";
import { fetchFamilyJSON } from "@/lib/auth/familyTokenClient";

function StatCard({ icon, label, value }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        padding: 12,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: "0.12em", opacity: 0.7, textTransform: "uppercase" }}>
        {icon} {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: "color-mix(in oklab, var(--lux-accent) 95%, transparent)" }}>{value}</div>
    </div>
  );
}

function fmtINR(n) {
  const x = Number(n);
  const v = Number.isFinite(x) ? x : 0;
  try {
    return v.toLocaleString("en-IN");
  } catch {
    return String(v);
  }
}

export function FamilyAdminView({ onExit }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    setLoading(true);
    setError("");
    try {
      const { r, j } = await fetchFamilyJSON("/api/admin/family-stats", { method: "GET" });
      if (!r.ok || !j?.ok) {
        if (r.status === 401) {
          setError("Session expired. Please re-enter the family PIN in chat to continue.");
        } else {
          setError(j?.error || "Failed to load stats");
        }
        setStats(null);
        setLoading(false);
        return;
      }
      setStats(j);
    } catch (e) {
      setError(String(e?.message || "Failed to load stats"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStats();
  }, []);

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 900, letterSpacing: "0.10em", textTransform: "uppercase" }}>
            📊 BM Wealth - Family Dashboard
          </div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>Family Admin Mode Active 👨‍👩‍👧</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={loadStats}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid color-mix(in oklab, var(--lux-accent) 35%, transparent)",
              background: "color-mix(in oklab, var(--lux-accent) 12%, transparent)",
              color: "color-mix(in oklab, var(--lux-accent) 95%, transparent)",
              fontWeight: 800,
              cursor: "pointer",
              minWidth: 110,
            }}
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 800,
              cursor: "pointer",
              minWidth: 90,
            }}
          >
            ❌ Exit
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ marginTop: 12, opacity: 0.75 }}>Loading stats...</div>
      ) : error ? (
        <div style={{ marginTop: 12, color: "#ffb4b4", fontSize: 13 }}>{error}</div>
      ) : (
        <>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.12em", opacity: 0.7 }}>TODAY</div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatCard icon="✅" label="Leads Captured" value={stats?.today?.leads ?? 0} />
              <StatCard icon="💬" label="Conversations" value={stats?.today?.conversations ?? 0} />
              <StatCard icon="💰" label="Revenue" value={`₹${fmtINR(stats?.today?.revenue ?? 0)}`} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.12em", opacity: 0.7 }}>THIS WEEK</div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatCard icon="✅" label="Total Leads" value={stats?.week?.leads ?? 0} />
              <StatCard icon="💰" label="Total Revenue" value={`₹${fmtINR(stats?.week?.revenue ?? 0)}`} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.12em", opacity: 0.7 }}>THIS MONTH</div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <StatCard icon="✅" label="Total Leads" value={stats?.month?.leads ?? 0} />
              <StatCard icon="💰" label="Total Revenue" value={`₹${fmtINR(stats?.month?.revenue ?? 0)}`} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.12em", opacity: 0.7 }}>LEAD BREAKDOWN (THIS WEEK)</div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.9 }}>
              <div style={{ fontSize: 13 }}>
                🔥 Hot:{" "}
                <span style={{ color: "color-mix(in oklab, var(--lux-accent) 95%, transparent)", fontWeight: 900 }}>{stats?.breakdown?.hot ?? 0}</span>
              </div>
              <div style={{ fontSize: 13 }}>
                🟡 Warm:{" "}
                <span style={{ color: "color-mix(in oklab, var(--lux-accent) 95%, transparent)", fontWeight: 900 }}>{stats?.breakdown?.warm ?? 0}</span>
              </div>
              <div style={{ fontSize: 13 }}>
                ⚪ Cold:{" "}
                <span style={{ color: "color-mix(in oklab, var(--lux-accent) 95%, transparent)", fontWeight: 900 }}>{stats?.breakdown?.cold ?? 0}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, opacity: 0.65 }}>
            Privacy note: This view shows only totals. No names, emails, or phone numbers.
          </div>
        </>
      )}
    </div>
  );
}
