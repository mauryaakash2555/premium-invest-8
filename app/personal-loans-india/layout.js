import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Personal Loans India | BM Wealth',
  description:
    'Understand personal loan options in India, compare use cases, and evaluate costs before taking short-term credit decisions.',
  path: '/personal-loans-india',
});

export default function Layout({ children }) {
  return children;
}
