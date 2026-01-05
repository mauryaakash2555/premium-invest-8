import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Disclaimer | BM Wealth Mumbai",
  description: "Important disclaimers and risk disclosures.",
  path: "/disclaimer",
});

export default function Layout({ children }) {
  return children;
}
