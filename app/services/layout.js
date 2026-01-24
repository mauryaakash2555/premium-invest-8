import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Wealth Services | Portfolio Management, Mutual Funds, Insurance | BM Wealth",
    description:
      "Explore BM Wealth services including PMS, mutual funds, insurance, fixed deposits and SIP planning. Premium advisory with a Mumbai-first approach.",
    path: "/services",
  }),
};

export default function Layout({ children }) {
  return children;
}