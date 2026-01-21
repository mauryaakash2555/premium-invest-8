import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-[70vh] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Payments happen on the Digital Store</h1>
        <p className="mt-3 text-sm opacity-80">If you landed here, please complete your purchase on our store subdomain.</p>

        <div className="mt-6 flex gap-3">
          <a
            className="rounded-none bg-[color:var(--color-matte-gold)] px-4 py-2 text-sm font-semibold text-black"
            href="https://store.bmwealth.co.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Digital Store
          </a>
          <Link className="rounded-none border border-white/10 px-4 py-2 text-sm font-semibold" href="/contact">
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
