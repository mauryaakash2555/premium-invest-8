import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Login | BM Wealth',
  description: 'Authentication.',
  path: '/login',
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return children;
}
