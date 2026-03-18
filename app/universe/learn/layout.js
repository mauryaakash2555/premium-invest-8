import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Learn Finance Concepts | BM Wealth',
  description:
    'Explore editorial learning hubs for investing, tax, mutual funds, and financial planning concepts with practical context.',
  path: '/universe/learn',
});

export default function Layout({ children }) {
  return children;
}
