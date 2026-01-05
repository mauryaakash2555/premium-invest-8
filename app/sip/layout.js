import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "SIP Investment Mumbai | Systematic Investment Plan Services | BM Wealth",
  description:
    "Start SIP in Mumbai with guidance on mutual fund selection and goal-based investing. AMFI Registered ARN 90008.",
  path: "/sip",
});

export default function Layout({ children }) {
  return children;
}
