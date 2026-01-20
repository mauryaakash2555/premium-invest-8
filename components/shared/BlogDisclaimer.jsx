"use client";

import { Info } from "lucide-react";

export default function BlogDisclaimer() {
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
      <Info
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
          Educational Content Disclaimer
        </h4>
        <p
          style={{
            color: "#d0d0d0",
            fontSize: "14px",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          This article is for educational and informational purposes only. It does not constitute 
          personalized financial advice or a recommendation to buy, sell, or hold any specific investment. 
          All investments carry risk, and past performance does not guarantee future results. Please 
          consult with a qualified financial advisor before making investment decisions based on your 
          individual circumstances, risk tolerance, and financial goals.
        </p>
      </div>
    </div>
  );
}
