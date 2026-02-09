import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "ITR Filing Help Tool | Form 16 Tax Summary | BM Wealth",
  description:
    "Upload Form 16/AIS PDF, review extracted fields, and compare old vs new tax regime estimates. Educational support for ITR filing workflows.",
  path: "/tools/itr-filing-help",
  type: "website",
  robots: { index: true, follow: true },
});

export default function Layout({ children }) {
  return children;
}
