import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Insurance — Educational Guide | BM Wealth",
  description:
    "Educational guide to insurance basics: term insurance, health insurance, key terms, and claim process checklists. No advice, no guarantees.",
  path: "/insurance",
});

export default function Layout({ children }) {
  return children;
}
