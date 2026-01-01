import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "About BM Wealth - Led by Brahmdeo Maurya | Mumbai Investment Advisory ARN 90008",
    description: "Learn about BM Wealth and founder Brahmdeo Maurya. IRDAI Licensed and AMFI Registered ARN 90008.",
    path: "/about-us",
  }),
};

export default function Layout({ children }) {
  return children;
}