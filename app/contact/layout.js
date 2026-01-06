import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Contact — BM Wealth",
    description:
      "Contact BM Wealth Mumbai for premium wealth services and distribution support. Office in Kalbadevi. Call +91 88509 77259 or WhatsApp.",
    path: "/contact",
  }),
};

export default function Layout({ children }) {
  return children;
}