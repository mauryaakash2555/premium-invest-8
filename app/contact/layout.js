import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Contact BM Wealth - Financial Advisory Services",
    description:
      "Get in touch with BM Wealth in Mumbai for portfolio management, mutual funds and insurance advisory. Call, WhatsApp or visit our Kalbadevi office.",
    path: "/contact",
  }),
};

export default function Layout({ children }) {
  return children;
}