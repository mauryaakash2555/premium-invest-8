export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for BM Digital Store.',
};

export default function StoreTermsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Legal</p>
        <h1 className="text-3xl font-semibold">Terms & Conditions</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70 space-y-4">
        <p>
          All products sold on this store are digital and educational in nature.
          Content is provided for informational purposes only and should not be considered financial advice.
        </p>
        <p>
          No promises: We do not promise outcomes, performance, or results.
        </p>
        <p>
          Delivery is digital only. No physical goods are shipped.
        </p>
        <p>
          If you have questions, contact us via the Contact page.
        </p>
      </div>
    </div>
  );
}
