import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Community Impact | BM Wealth",
  description: "Stories and outcomes that improve everyday financial life.",
  path: "/blog/impact",
});

export default function BlogImpactPage() {
  return <PillarIndexClient pillar="IMPACT" />;
}
