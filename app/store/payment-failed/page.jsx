import Link from "next/link";

export const metadata = {
  title: "Payment Failed",
  description: "Your payment was not completed.",
};

export default function StorePaymentFailedPage() {
  return (
    <main className="min-h-[70vh] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Payment Failed</h1>
        <p className="mt-3 text-sm opacity-80">Your payment was not completed. Please try again from the product page.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-none bg-[color:var(--color-matte-gold)] px-4 py-2 text-sm font-semibold text-black" href="/products">
            Back to Store
          </Link>
          <Link className="rounded-none border border-white/10 px-4 py-2 text-sm font-semibold" href="/contact">
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
