export const metadata = {
  title: 'Delivery',
  description: 'Digital delivery policy for BM Digital Store.',
};

export default function StoreDeliveryPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Legal</p>
        <h1 className="text-3xl font-semibold">Delivery / Shipping Policy</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70 space-y-4">
        <p>
          All products are delivered digitally. <strong className="text-white">No physical goods are shipped</strong>.
        </p>
        <p>
          Access to digital content is provided immediately after successful payment (once payments are enabled),
          either via on-screen access or via an email/download link.
        </p>
        <p>If you do not receive access due to a technical issue, please contact us and we will help resolve it.</p>
      </div>
    </div>
  );
}
