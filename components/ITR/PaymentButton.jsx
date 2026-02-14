'use client';
export default function PaymentButton() {
  return (
    <div className="bg-[color:var(--lux-card)]/70 border border-[color:var(--lux-foreground-10)] rounded-lg p-8 text-center mt-6">
      <h3 className="text-xl font-bold mb-2">Get Your Full ITR Summary</h3>
      <p className="text-[color:var(--lux-foreground-60)] mb-6">Download detailed PDF report with both tax regimes</p>
      <a
        href="https://store.bmwealth.co.in"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-[color:var(--lux-accent)] text-[color:var(--lux-background)] px-12 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition"
      >
        Get Full ITR Summary →
      </a>
    </div>
  );
}
