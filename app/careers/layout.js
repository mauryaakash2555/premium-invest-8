import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Careers at BM Wealth | Join Our Team Mumbai",
  description: "Join BM Wealth Mumbai. Career opportunities across distribution, insurance, and client support.",
  path: "/careers",
});

export default function Layout({ children }) {
  return children;
}
