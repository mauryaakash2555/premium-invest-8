import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Public Impact | BM Wealth",
  description: "Civic issues, community stories, and public outcomes.",
  path: "/blog/impact",
});

export default function BlogImpactPage() {
  return <PillarIndexClient pillar="IMPACT" />;
}
