import blogPosts from "@/data/blog.json";
import products from "@/data/products.json";
import sipPlans from "@/data/sipPlans.json";

const kpiCards = [
  {
    label: "Active journeys",
    value: "18",
    delta: "+3 this week",
  },
  {
    label: "Avg. SIP ticket",
    value: "₹6,400",
    delta: "Blended across plans",
  },
  {
    label: "Products in pilot",
    value: products.length.toString(),
    delta: "Demo slate",
  },
];

export const metadata = {
  title: "Dashboard",
  description: "Demo dashboard view for BM Wealth Next.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Snapshot</p>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-200/80">
          Replace these placeholders with live metrics when your APIs are ready.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card) => (
          <div key={card.label} className="card p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300/70">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="text-sm text-emerald-200/80">{card.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent blog posts</h2>
            <span className="text-sm text-slate-300/70">{blogPosts.length} items</span>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-slate-200/85">
            {blogPosts.map((post) => (
              <li
                key={post.slug}
                className="flex items-start justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-white">{post.title}</div>
                  <div className="text-xs text-slate-300">{post.summary}</div>
                </div>
                <span className="text-xs text-slate-400">{post.published}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">SIP plans</h2>
            <span className="text-sm text-slate-300/70">{sipPlans.length} options</span>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-slate-200/85">
            {sipPlans.map((plan) => (
              <li
                key={plan.id}
                className="flex items-start justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-white">{plan.label}</div>
                  <div className="text-xs text-slate-300">
                    ₹{plan.monthly.toLocaleString("en-IN")} · {plan.rate}% · {plan.years}y
                  </div>
                </div>
                <span className="text-xs text-emerald-200/80">Active</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

