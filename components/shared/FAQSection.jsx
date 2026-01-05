"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "60px auto",
        padding: "0 20px",
      }}
    >
      <h2
        style={{
          fontSize: "clamp(32px, 5vw, 42px)",
          fontFamily: '"Playfair Display", serif',
          color: "#DAA520",
          textAlign: "center",
          marginBottom: "40px",
          fontWeight: "600",
        }}
      >
        Frequently Asked Questions
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              background: openIndex === index
                ? "linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)"
                : "rgba(0, 0, 0, 0.4)",
              border: `1px solid ${openIndex === index ? "rgba(218, 165, 32, 0.4)" : "rgba(218, 165, 32, 0.2)"}`,
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              style={{
                width: "100%",
                padding: "24px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: openIndex === index ? "#DAA520" : "#e5e5e5",
                  lineHeight: "1.5",
                  transition: "color 0.3s ease",
                }}
              >
                {faq.question}
              </span>
              <ChevronDown
                size={24}
                style={{
                  color: "#DAA520",
                  transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  flexShrink: 0,
                }}
              />
            </button>

            <div
              style={{
                maxHeight: openIndex === index ? "500px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease",
              }}
            >
              <div
                style={{
                  padding: "0 24px 24px 24px",
                  fontSize: "16px",
                  color: "#d0d0d0",
                  lineHeight: "1.7",
                }}
              >
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
