import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Terms and Conditions | BM Wealth",
  description:
    "Read BM Wealth terms and conditions covering website use, educational tools, third-party links, risk disclosures, and contact information.",
  path: "/terms-and-conditions",
  type: "website",
  robots: { index: true, follow: true },
});

export default function Layout({ children }) {
  return children;
}
