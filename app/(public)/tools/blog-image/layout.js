import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Blog Image Generator | BM Wealth',
  description:
    'Generate polished blog-image concepts from article content using BM Wealth\'s public image tool.',
  path: '/tools/blog-image',
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return children;
}
