export const metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Refund policy for BM Digital Store.',
};

export default function StoreRefundPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Legal</p>
        <h1 className="text-3xl font-semibold">Refund & Cancellation Policy</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70 space-y-4">
        <p>
          Since the products are digital in nature, refunds are not provided once the content is accessed
          or the digital delivery has been completed.
        </p>
        <p>
          Refunds are provided only in case of duplicate payment or a verified technical failure where
          access could not be provided.
        </p>
        <p>
          If a refund is approved, it will be processed within <strong className="text-white">5–7 working days</strong>
          to the original payment method.
        </p>
        <p>
          To request a refund, contact us via the Contact page with transaction details.
        </p>
      </div>
    </div>
  );
}
