import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLocalCommunityPosts } from '@/lib/blog/localCommunityPosts';

export const metadata = buildMetadata({
  title: "Community Impact | BM Wealth",
  description: "Stories and outcomes that improve everyday financial life.",
  path: "/blog/impact",
});

export default async function BlogImpactPage() {
  const localAll = await getLocalCommunityPosts({ includeContent: false }).catch(() => []);
  const initialPosts = (Array.isArray(localAll) ? localAll : []).filter((p) => String(p?.pillar || '').toUpperCase() === 'IMPACT' && String(p?.status || '').toUpperCase() === 'APPROVED');
  return <PillarIndexClient pillar="IMPACT" initialPosts={initialPosts} />;
}
