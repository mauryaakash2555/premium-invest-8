import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mutual Funds — Educational Guide | BM Wealth",
  description:
    "Educational guide to mutual funds: types, direct vs regular, SIP vs lump sum, and practical checklists. No advice, no guarantees.",
  path: "/mutual-funds",
});

export default function Layout({ children }) {
  return children;
}
