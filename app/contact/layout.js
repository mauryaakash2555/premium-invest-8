import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Contact BM Wealth Mumbai | Financial Advisory",
    description: "Contact BM Wealth for expert financial advisory services in Mumbai.",
    path: "/contact",
  }),
};

export default function Layout({ children }) {
  return children;
}