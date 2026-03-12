"use client";

import { ShieldCheck } from "lucide-react";

export default function AffiliateDisclosure() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)",
        border: "1px solid color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.08))",
        borderRadius: "0px",
        padding: "24px",
        margin: "40px 0",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
      }}
    >
      <ShieldCheck
        size={22}
        style={{
          color: "var(--lux-accent)",
          flexShrink: 0,
          marginTop: "2px",
        }}
      />
      <div>
        <h4
          style={{
            color: "var(--lux-accent)",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "10px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Affiliate Disclosure
        </h4>
        <p
          style={{
            color: "#d0d0d0",
            fontSize: "14px",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          Some links in this article are affiliate links. BM Wealth may earn a 
          commission at no extra cost to you. Our editorial research and recommendations 
          remain entirely independent — we only feature products we genuinely evaluate.
        </p>
      </div>
    </div>
  );
}
