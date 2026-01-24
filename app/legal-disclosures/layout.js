import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Legal Disclosures | BM Wealth",
  description:
    "Read BM Wealth legal disclosures, licensing and important investor information.",
  path: "/legal-disclosures",
});

export default function Layout({ children }) {
  return children;
}
