import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Universe | BM Wealth',
  description: 'Utility learning universe entry route.',
  path: '/universe',
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return children;
}
