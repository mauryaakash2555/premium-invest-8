export const metadata = {
  title: 'Contact Us',
  description: 'Contact BM Digital Store.',
};

export default function StoreContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Support</p>
        <h1 className="text-3xl font-semibold">Contact Us</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70 space-y-3">
        <p><span className="text-white/80">Email:</span> mauryaakash2555@gmail.com</p>
        <p><span className="text-white/80">Phone:</span> +91 8850977259</p>
        <p><span className="text-white/80">Location:</span> Mumbai, Maharashtra, India</p>
        <p className="pt-2 text-xs text-white/60">
          For order/payment issues (once payments are enabled), please include your name and transaction details.
        </p>
      </div>
    </div>
  );
}
