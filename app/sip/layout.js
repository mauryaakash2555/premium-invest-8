import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "SIP (Systematic Investment Plan) — Educational Guide | BM Wealth",
  description:
    "Educational guide to SIPs: how they work, key terms, checklists, and common myths. No advice, no promises.",
  path: "/sip",
});

export default function Layout({ children }) {
  return children;
}
