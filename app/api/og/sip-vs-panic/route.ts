import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

function formatLakhs(amount: number): string {
  const v = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return `₹${(v / 100_000).toFixed(2)}L`;
}

function safeNumber(v: string | null): number {
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function safeLabel(v: string | null, max = 28): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function titleCase(v: string): string {
  const s = String(v || "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const monthly = safeNumber(sp.get("m"));
  const years = safeNumber(sp.get("y"));
  const cost = safeNumber(sp.get("cost"));
  const disciplined = safeNumber(sp.get("disc"));
  const panic = safeNumber(sp.get("panic"));

  const tax = safeLabel(sp.get("tax"), 18);
  const rc = safeLabel(sp.get("rc"), 18);
  const crash = safeLabel(sp.get("crash"), 18);
  const partner = safeLabel(sp.get("partner"), 32);

  const title = "SIP vs Panic Selling";

  const h = React.createElement;

  const root = h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#070708",
        padding: 64,
        color: "#FFFFFF",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      },
    },
    h(
      "div",
      { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 10 } },
        h("div", { style: { fontSize: 44, fontWeight: 800, letterSpacing: -1 } }, title),
        h(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" } },
          h("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.78)" } }, "Education-only simulator"),
          h("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.40)" } }, "•"),
          h("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.78)" } }, "BM Wealth Intelligence"),
          partner
            ? h(
                "div",
                {
                  style: {
                    marginLeft: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.22)",
                    color: "rgba(255,255,255,0.82)",
                    fontSize: 16,
                  },
                },
                `Partner: ${partner}`
              )
            : null
        )
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
            padding: "14px 18px",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 18,
            backgroundColor: "rgba(0,0,0,0.22)",
          },
        },
        h(
          "div",
          { style: { fontSize: 14, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 } },
          "Behavioral cost"
        ),
        h("div", { style: { fontSize: 46, fontWeight: 900, color: "var(--lux-accent)" } }, formatLakhs(cost))
      )
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          gap: 18,
          flexDirection: "column",
          padding: 22,
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.12)",
          backgroundColor: "rgba(0,0,0,0.28)",
        },
      },
      crash || rc || tax
        ? h(
            "div",
            { style: { display: "flex", gap: 10, flexWrap: "wrap" } },
            crash
              ? h(
                  "div",
                  {
                    style: {
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(0,0,0,0.22)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 16,
                    },
                  },
                  `Crash preset: ${crash}`
                )
              : null,
            rc
              ? h(
                  "div",
                  {
                    style: {
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(0,0,0,0.22)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 16,
                    },
                  },
                  `Risk comfort: ${titleCase(rc)}`
                )
              : null,
            tax
              ? h(
                  "div",
                  {
                    style: {
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.12)",
                      backgroundColor: "rgba(0,0,0,0.22)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 16,
                    },
                  },
                  `Tax: ${tax}`
                )
              : null
          )
        : null,
      h(
        "div",
        { style: { display: "flex", justifyContent: "space-between", gap: 18 } },
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          h(
            "div",
            { style: { fontSize: 14, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 } },
            "Stay disciplined"
          ),
          h("div", { style: { fontSize: 34, fontWeight: 800 } }, formatLakhs(disciplined))
        ),
        h("div", { style: { width: 1, backgroundColor: "rgba(255,255,255,0.12)" } }),
        h(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          h(
            "div",
            { style: { fontSize: 14, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1 } },
            "Panic behavior"
          ),
          h("div", { style: { fontSize: 34, fontWeight: 800 } }, formatLakhs(panic))
        )
      ),
      h(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
        h("div", { style: { fontSize: 18, color: "rgba(255,255,255,0.75)" } }, `Inputs: ₹${monthly.toLocaleString("en-IN")}/month • ${years} years`),
        h("div", { style: { fontSize: 16, color: "rgba(255,255,255,0.55)" } }, "bmwealth.co.in")
      )
    )
  );

  return new ImageResponse(
    root,
    {
      width: 1200,
      height: 630,
    }
  );
}
