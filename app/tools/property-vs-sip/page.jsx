import BackRow from "@/components/shared/BackRow";

import { PropertyVsSipCalculator } from "@/components/calculators/PropertyVsSipCalculator";

export const metadata = {
  title: "Mumbai Property vs SIP Analyzer | BM Wealth",
  description: "Compare Mumbai property growth vs SIP compounding with locked assumptions. Unlock a 15-page wealth gap report.",
};

export default function PropertyVsSipToolPage() {
  return (
    <>
      <BackRow />
      <section className="px-6 lg:px-10 py-14 lg:py-20">
        <PropertyVsSipCalculator />
      </section>
    </>
  );
}
