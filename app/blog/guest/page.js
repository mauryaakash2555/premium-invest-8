import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLocalCommunityPosts } from '@/lib/blog/localCommunityPosts';

export const metadata = buildMetadata({
  title: "Guest Columns | BM Wealth",
  description: "Expert perspectives from verified professionals.",
  path: "/blog/guest",
});

export default async function BlogGuestPage() {
  const localAll = await getLocalCommunityPosts({ includeContent: false }).catch(() => []);
  const initialPosts = (Array.isArray(localAll) ? localAll : []).filter((p) => String(p?.pillar || '').toUpperCase() === 'GUEST' && String(p?.status || '').toUpperCase() === 'APPROVED');
  return <PillarIndexClient pillar="GUEST" initialPosts={initialPosts} />;
}
