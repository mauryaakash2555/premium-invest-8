import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLocalCommunityPosts } from '@/lib/blog/localCommunityPosts';

export const metadata = buildMetadata({
  title: "Developer Insight | BM Wealth",
  description: "Product, engineering, AI, and systems thinking.",
  path: "/blog/dev",
});

export default async function BlogDevPage() {
  const localAll = await getLocalCommunityPosts({ includeContent: false }).catch(() => []);
  const initialPosts = (Array.isArray(localAll) ? localAll : []).filter((p) => String(p?.pillar || '').toUpperCase() === 'DEV' && String(p?.status || '').toUpperCase() === 'APPROVED');
  return <PillarIndexClient pillar="DEV" initialPosts={initialPosts} />;
}
