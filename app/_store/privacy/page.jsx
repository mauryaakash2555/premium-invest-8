export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for BM Digital Store.',
};

export default function StorePrivacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Legal</p>
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      </div>

      <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-white/70 space-y-4">
        <p>
          We may collect basic customer information such as name, email address, and phone number to provide
          order updates and support.
        </p>
        <p>
          Payments are processed via third-party payment gateways.
          <strong className="text-white"> We do NOT store card, UPI, or banking details</strong> on our servers.
        </p>
        <p>
          We do not sell personal data. We may share limited information with service providers only for
          payment processing and digital delivery.
        </p>
        <p>
          For privacy requests, contact us via the Contact page.
        </p>
      </div>
    </div>
  );
}
