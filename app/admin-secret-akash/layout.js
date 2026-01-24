import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Admin | BM Wealth',
  description: 'Restricted admin area.',
  path: '/admin-secret-akash',
  robots: { index: false, follow: false },
});

export default function Layout({ children }) {
  return children;
}
