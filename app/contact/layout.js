import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Contact — BM Wealth",
    description:
      "Contact BM Wealth Mumbai for questions about our educational guides or distribution support. Office in Kalbadevi. Call +91 88509 77259 or WhatsApp. No investment advice or guarantees.",
    path: "/contact",
  }),
};

export default function Layout({ children }) {
  return children;
}