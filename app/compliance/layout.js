import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Regulatory Compliance & Investor Charter | BM Wealth',
  description:
    'BM Wealth compliance and investor charter: transparency, integrity, and investor protection aligned with applicable regulations and best practices.',
  path: '/compliance',
});

export default function Layout({ children }) {
  return <>{children}</>;
}
