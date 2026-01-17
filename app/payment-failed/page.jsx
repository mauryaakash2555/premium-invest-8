export default function PaymentFailedPage() {
  return (
    <main className="min-h-[70vh] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Payment Failed</h1>
        <p className="mt-3 text-sm opacity-80">
          Your payment was not completed. Please try again.
        </p>

        <div className="mt-6 flex gap-3">
          <a className="rounded-md bg-[color:var(--color-matte-gold)] px-4 py-2 text-sm font-semibold text-black" href="/">
            Back to Home
          </a>
          <a className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold" href="/contact">
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
