"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    window.dispatchEvent(new Event("cookie-consent"));
    setShow(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    window.dispatchEvent(new Event("cookie-consent"));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, rgba(10,10,10,0.98) 0%, rgba(20,20,20,0.98) 100%)",
        borderTop: "1px solid rgba(218, 165, 32, 0.2)",
        padding: "20px",
        zIndex: 9999,
        backdropFilter: "blur(10px)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <p style={{ color: "#fff", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>
            We use cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
            By continuing to browse, you consent to our use of cookies.{" "}
            <a href="/privacy" style={{ color: "#DAA520", textDecoration: "underline" }}>
              Privacy Policy
            </a>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={declineCookies}
            style={{
              background: "transparent",
              border: "1px solid rgba(218, 165, 32, 0.3)",
              color: "#DAA520",
              padding: "10px 24px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#DAA520";
              e.target.style.background = "rgba(218, 165, 32, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "rgba(218, 165, 32, 0.3)";
              e.target.style.background = "transparent";
            }}
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            style={{
              background: "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)",
              border: "none",
              color: "#000",
              padding: "10px 32px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(218, 165, 32, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
