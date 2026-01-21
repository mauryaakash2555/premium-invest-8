"use client";

import { useCallback, useMemo, useState } from "react";

function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("razorpay_script_failed")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("razorpay_script_failed"));
    document.body.appendChild(script);
  });
}

export function RazorpayCheckoutButton({
  productSlug,
  productName,
  buttonLabel = "Buy Now",
  className = "rounded-none border border-white/15 bg-white/5 px-5 py-3 text-sm text-white hover:bg-white/10",
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const safeSlug = useMemo(() => String(productSlug || "").trim(), [productSlug]);

  const startCheckout = useCallback(async () => {
    if (!safeSlug) return;

    setBusy(true);
    setNote("");
    try {
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: safeSlug }),
      });

      const orderJson = await orderRes.json().catch(() => null);
      if (!orderRes.ok || !orderJson?.orderId || !orderJson?.keyId) {
        throw new Error(orderJson?.error || "order_create_failed");
      }

      await loadRazorpayScript();

      const options = {
        key: orderJson.keyId,
        amount: orderJson.amount,
        currency: orderJson.currency || "INR",
        name: "BM Wealth Digital Store",
        description: productName || orderJson?.product?.name || "Digital product",
        order_id: orderJson.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json().catch(() => null);
            if (!verifyRes.ok || !verifyJson?.ok) throw new Error("verify_failed");
            window.location.assign(`/payment-success?product=${encodeURIComponent(safeSlug)}`);
          } catch {
            window.location.assign(`/payment-failed?product=${encodeURIComponent(safeSlug)}`);
          }
        },
        modal: {
          ondismiss: () => {
            setNote("Payment cancelled.");
          },
        },
        theme: { color: "#C9A24D" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        window.location.assign(`/payment-failed?product=${encodeURIComponent(safeSlug)}`);
      });
      rzp.open();
    } catch (e) {
      setNote("Could not start payment. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [productName, safeSlug]);

  return (
    <div className="flex flex-col items-end gap-2">
      <button type="button" disabled={busy || !safeSlug} onClick={startCheckout} className={className}>
        {busy ? "Starting…" : buttonLabel}
      </button>
      {note ? <div className="text-xs text-white/60">{note}</div> : null}
    </div>
  );
}
