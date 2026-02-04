"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const hideOnLiveMood = false;
  const hideOnLearn = typeof pathname === "string" && pathname.startsWith("/learn");

  useEffect(() => {
    if (hideOnLiveMood || hideOnLearn) {
      setShow(false);
      return;
    }
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, [hideOnLiveMood]);

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

  if (hideOnLiveMood || hideOnLearn || !show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, rgba(10,10,10,0.98) 0%, rgba(20,20,20,0.98) 100%)",
        borderTop: "1px solid color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.06))",
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
            <a href="/privacy" style={{ color: "var(--lux-accent)", textDecoration: "underline" }}>
              Privacy Policy
            </a>
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={declineCookies} className="lux-cta-ghost" style={{ fontSize: "12px", padding: "12px 20px" }}>
            Decline
          </button>
          <button onClick={acceptCookies} className="lux-cta-primary" style={{ fontSize: "12px", padding: "12px 24px" }}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
