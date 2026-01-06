"use client";

import { AlertTriangle } from "lucide-react";

export default function RiskWarning({ type = "general" }) {
  const warnings = {
    mutualFunds: {
      title: "Investment Risk Disclosure",
      text: "Mutual fund investments are subject to market risks. Past performance does not assure future returns. Please read all scheme-related documents carefully before investing. Consider your investment objectives and risk tolerance."
    },
    trading: {
      title: "Trading Risk Warning",
      text: "Trading in stocks, derivatives, and other securities involves substantial risk of loss. Approximately 90% of retail traders lose money. Only invest capital you can afford to lose. Past performance is not indicative of future results."
    },
    pms: {
      title: "Portfolio Management Disclosure",
      text: "Portfolio management services involve market risks. Returns are not assured and capital may be at risk. Investments are subject to market volatility. Carefully assess your risk appetite before investing."
    },
    general: {
      title: "Important Disclosure",
      text: "All investments carry risk. The information provided is for educational purposes only and should not be considered as personalized investment advice. Please consult with a qualified financial advisor before making investment decisions."
    }
  };

  const warning = warnings[type] || warnings.general;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(184, 134, 11, 0.08) 100%)",
        border: "1px solid rgba(218, 165, 32, 0.3)",
        borderRadius: "8px",
        padding: "16px",
        margin: "24px 0",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
      }}
    >
      <AlertTriangle
        size={24}
        style={{
          color: "#DAA520",
          flexShrink: 0,
          marginTop: "2px",
        }}
      />
      <div>
        <h3
          style={{
            color: "#DAA520",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "8px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {warning.title}
        </h3>
        <p
          style={{
            color: "#e5e5e5",
            fontSize: "14px",
            lineHeight: "1.7",
            margin: 0,
          }}
        >
          {warning.text}
        </p>
      </div>
    </div>
  );
}
