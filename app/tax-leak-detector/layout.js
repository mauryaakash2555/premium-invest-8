import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Tax Leak Detector | BM Wealth",
  description:
    "Detect common tax leaks and compare old vs new regime outcomes. Use BM Wealth’s tax tool to estimate savings and plan execution.",
  path: "/tax-leak-detector",
});

export default function Layout({ children }) {
  return children;
}
