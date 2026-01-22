import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Intelligence | BM Wealth",
  description:
    "BM Wealth Intelligence — simulation engine powering advanced India-first financial tools.",
  path: "/intelligence",
});

export default function IntelligencePage() {
  return (
    <main className="px-6 lg:px-10 py-14 lg:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
          Intelligence
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/75">
          This section is being powered by a new simulation engine. UI will be
          built later; today’s focus is core logic.
        </p>
      </div>
    </main>
  );
}
