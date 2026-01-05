"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(184, 134, 11, 0.08) 100%)",
        border: "1px solid rgba(218, 165, 32, 0.3)",
        borderRadius: "12px",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <Mail size={28} style={{ color: "#000" }} />
      </div>

      <h3
        style={{
          fontSize: "clamp(24px, 4vw, 32px)",
          fontFamily: '"Playfair Display", serif',
          color: "#DAA520",
          marginBottom: "12px",
          fontWeight: "600",
        }}
      >
        Stay Informed on Wealth Creation
      </h3>

      <p
        style={{
          fontSize: "16px",
          color: "#d0d0d0",
          marginBottom: "28px",
          lineHeight: "1.7",
          maxWidth: "500px",
          margin: "0 auto 28px",
        }}
      >
        Get exclusive investment insights, market updates, and financial planning tips delivered to your inbox.
      </p>

      {status === "success" ? (
        <div
          style={{
            padding: "16px",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "8px",
            color: "#22c55e",
            fontSize: "15px",
          }}
        >
          ✓ Successfully subscribed! Check your email for confirmation.
        </div>
      ) : status === "error" ? (
        <div
          style={{
            padding: "16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#ef4444",
            fontSize: "15px",
            marginBottom: "20px",
          }}
        >
          Something went wrong. Please try again.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexDirection: window.innerWidth < 640 ? "column" : "row",
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={status === "loading"}
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: "8px",
              border: "1px solid rgba(218, 165, 32, 0.3)",
              background: "rgba(0, 0, 0, 0.4)",
              color: "#fff",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              padding: "14px 32px",
              background: status === "loading" 
                ? "rgba(218, 165, 32, 0.5)" 
                : "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </form>

      <p
        style={{
          fontSize: "13px",
          color: "#999",
          marginTop: "16px",
          fontStyle: "italic",
        }}
      >
        No spam, unsubscribe anytime. Your email is safe with us.
      </p>
    </div>
  );
}
