'use client';

import { useEffect } from 'react';

function luxAccentToHex() {
  try {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--lux-accent').trim();
    if (!accent) return null;

    const probe = document.createElement('div');
    probe.style.color = accent;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    document.body.removeChild(probe);

    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!m) return null;

    const toHex = (n) => Number(n).toString(16).padStart(2, '0');
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  } catch {
    return null;
  }
}

export default function PaymentButton({ amount, onSuccess }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handlePayment() {
    // Create order
    const res = await fetch('/api/itr/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const json = await res.json();
    const { orderId } = json || {};

    if (!orderId) {
      throw new Error(json?.error || 'Failed to create order');
    }

    if (!window?.Razorpay) {
      throw new Error('Razorpay checkout failed to load');
    }

    // Open Razorpay
    const luxHex = luxAccentToHex();
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      name: 'BM Wealth',
      description: 'ITR Filing Help',
      order_id: orderId,
      handler: function (response) {
        onSuccess(response.razorpay_payment_id);
      },
      ...(luxHex ? { theme: { color: luxHex } } : {}),
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-8 text-center mt-6">
      <h3 className="text-xl font-bold mb-2">Get Your Full ITR Summary</h3>
      <p className="text-[color:var(--lux-foreground-60)] mb-6">Download detailed PDF report with both tax regimes</p>
      <div className="text-4xl font-bold text-[color:var(--lux-accent)] mb-6">₹{(amount / 100).toFixed(0)}</div>
      <button
        onClick={() => {
          handlePayment().catch((e) => {
            alert(e?.message || 'Payment failed');
          });
        }}
        className="bg-[color:var(--lux-accent)] text-[color:var(--lux-background)] px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition"
      >
        Pay & Download Report
      </button>
      <p className="text-xs text-[color:var(--lux-foreground-60)] mt-4">Secure payment via Razorpay</p>
    </div>
  );
}
