import Link from "next/link";
import blogPosts from "@/data/blog.json";
import products from "@/data/products.json";
import sipPlans from "@/data/sipPlans.json";

const quickLinks = [
  { href: "/login", label: "Login", blurb: "Try the auth shell" },
  { href: "/dashboard", label: "Dashboard", blurb: "View demo KPIs" },
  { href: "/blog", label: "Blog", blurb: "Read sample posts" },
  { href: "/products", label: "Products", blurb: "Browse offerings" },
  { href: "/sip-calculator", label: "SIP Calculator", blurb: "Estimate growth" },
];

export default function Home() {
  const featuredPost = blogPosts[0];
  const featuredProduct = products[0];
  const sipPlan = sipPlans[0];

  return (
    <div className="space-y-10">
      <section className="card relative overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-emerald-400/10" />
        <div className="relative flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80">
            BM Wealth · Next.js sandbox
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Next.js 15 + Tailwind starter for the BM Wealth experience
          </h1>
          <p className="max-w-2xl text-lg text-slate-200/80">
            Lightweight demo routes for onboarding, dashboards, products, and content.
            Everything here is placeholder-friendly so you can wire up APIs later.
          </p>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg bg-blue-500/80 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-400"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">
                Feature highlight
              </p>
              <h2 className="text-2xl font-semibold text-white">{featuredPost.title}</h2>
              <p className="mt-2 text-sm text-slate-200/80">{featuredPost.summary}</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
              Blog
            </span>
          </div>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="mt-4 inline-flex items-center text-sm font-semibold text-blue-200 hover:text-white"
          >
            Read the preview →
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/70">
                Flagship
              </p>
              <h2 className="text-2xl font-semibold text-white">{featuredProduct.name}</h2>
              <p className="mt-2 text-sm text-slate-200/80">
                {featuredProduct.description}
              </p>
            </div>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-100">
              {featuredProduct.category}
            </span>
          </div>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center text-sm font-semibold text-blue-200 hover:text-white"
          >
            See all products →
          </Link>
        </div>
      </section>

      <section className="card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-200/70">
              SIP quick look
            </p>
            <h3 className="text-xl font-semibold text-white">{sipPlan.label}</h3>
            <p className="text-sm text-slate-200/80">
              ₹{sipPlan.monthly.toLocaleString("en-IN")} / month · {sipPlan.rate}% expected ·{" "}
              {sipPlan.years} year horizon
            </p>
          </div>
          <Link
            href="/sip-calculator"
            className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold transition hover:border-white/40 hover:bg-white/10"
          >
            Open calculator
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card flex flex-col gap-2 p-4 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-white">{item.label}</div>
            <p className="text-sm text-slate-200/80">{item.blurb}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
