import { buildMetadata } from '@/lib/seo/metadata';

function slugToTitle(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const topicId = typeof resolvedParams?.topicId === 'string' ? resolvedParams.topicId : 'topic';
  const topicTitle = slugToTitle(topicId) || 'Topic';

  return buildMetadata({
    title: `${topicTitle} | BM Wealth Learn`,
    description:
      `Editorial learning hub for ${topicTitle}. Explore core concepts, examples, practice prompts, and related financial insights.`,
    path: `/universe/learn/${topicId}`,
  });
}

export default function Layout({ children }) {
  return children;
}
