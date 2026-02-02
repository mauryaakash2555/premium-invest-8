import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'About BM Wealth | Mumbai Advisory Practice | BM Wealth',
  description:
    'Learn about BM Wealth — a Mumbai-based advisory practice focused on disciplined execution, transparent communication, and documentation-first workflows since 1989.',
  path: '/about',
});

export default function Layout({ children }) {
  return <>{children}</>;
}



