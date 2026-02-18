import CommunityPostDetailClient from './CommunityPostDetailClient';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Community Post | BM Wealth',
  description: 'Community impact and guest submissions approved by BM Wealth.',
  path: '/blog/community',
});

export default async function CommunityPostPage({ params }) {
  const resolved = await params;
  return <CommunityPostDetailClient id={resolved?.id} />;
}
