export const metadata = {
  title: 'Contact',
  description: 'Contact BM Digital Store.',
};

export default function StoreContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Support</p>
        <h1 className="text-3xl font-semibold">Contact</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70 space-y-3">
        <p>For support queries related to digital delivery or refunds, please reach out:</p>
        <p className="text-white">
          Email: <span className="text-white/80">support@bmwealth.co.in</span>
        </p>
        <p className="text-white">
          Phone: <span className="text-white/80">+91 8850977259</span>
        </p>
        <p className="text-white">
          Location: <span className="text-white/80">Mumbai, Maharashtra, India</span>
        </p>
        <p className="text-white">
          Address: <span className="text-white/80">Mumbai, Maharashtra – 400002, India</span>
        </p>
      </div>
    </div>
  );
}
