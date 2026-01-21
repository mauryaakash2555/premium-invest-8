export const metadata = {
  title: 'About',
  description: 'About BM Digital Store.',
};

export default function StoreAboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Store</p>
        <h1 className="text-3xl font-semibold">About</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70 space-y-4">
        <p>
          BM Digital Store sells digital educational PDFs, guides, and learning tools.
          All content is designed for educational and informational purposes only.
        </p>
        <p>
          This store does not provide 1:1 guidance or consulting. All products are delivered digitally.
        </p>
        <p className="text-white/80">
          Disclaimer: Content is for educational purposes only. This is not advice of any kind.
        </p>
      </div>
    </div>
  );
}
