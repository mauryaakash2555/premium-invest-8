'use client';

import { useEffect } from 'react';

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
      theme: {
        color: '#d4af37',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-8 text-center mt-6">
      <h3 className="text-xl font-bold mb-2">Get Your Full ITR Summary</h3>
      <p className="text-[#9ca3af] mb-6">Download detailed PDF report with both tax regimes</p>
      <div className="text-4xl font-bold text-[#d4af37] mb-6">₹{(amount / 100).toFixed(0)}</div>
      <button
        onClick={() => {
          handlePayment().catch((e) => {
            alert(e?.message || 'Payment failed');
          });
        }}
        className="bg-[#d4af37] text-[#0a0a0a] px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition"
      >
        Pay & Download Report
      </button>
      <p className="text-xs text-[#9ca3af] mt-4">Secure payment via Razorpay</p>
    </div>
  );
}
