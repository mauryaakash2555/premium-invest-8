import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Developer Insight | BM Wealth",
  description: "Product, engineering, AI, and systems thinking.",
  path: "/blog/dev",
});

export default function BlogDevPage() {
  return <PillarIndexClient pillar="DEV" />;
}
