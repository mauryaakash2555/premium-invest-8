import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'About (Legacy) | BM Wealth',
  description: 'Legacy URL. Redirects to the canonical About Us page.',
  path: '/about',
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return <>{children}</>;
}



