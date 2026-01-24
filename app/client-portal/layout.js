import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Client Portal | BM Wealth',
  description: 'Client portal access.',
  path: '/client-portal',
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return children;
}
