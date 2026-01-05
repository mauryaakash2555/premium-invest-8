import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Contact Financial Advisor Mumbai | BM Wealth ARN 90008 | Free Consultation",
    description: "Contact BM Wealth Mumbai for financial planning consultation. AMFI & IRDAI licensed. Office in Kalbadevi. Call +91 88509 77259 or WhatsApp. Free portfolio review for Mumbai investors.",
    path: "/contact",
  }),
};

export default function Layout({ children }) {
  return children;
}