import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Partner Placement Framework (Invite-Only) | BM Wealth",
    description:
      "An invite-only partner placement framework for qualified firms and professionals. Expression of interest is available for eligible partners.",
    path: "/curated-partners",
  }),
  keywords: "curated partners, investing tools, BM Wealth, Mumbai, AMFI, IRDAI",
};

export default function Layout({ children }) {
  return children;
}