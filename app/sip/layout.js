import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "SIP (Systematic Investment Plan) | BM Wealth",
  description:
    "SIP planning support with a premium, process-led approach: goal mapping, fund selection framework, and review cadence.",
  path: "/sip",
});

export default function Layout({ children }) {
  return children;
}
