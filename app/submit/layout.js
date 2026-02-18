import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Submit Content | BM Wealth',
  description: 'Submit your investment insights, guest columns, or community impact stories to BM Wealth Talks.',
  path: '/submit',
  robots: { index: false, follow: true },
});

export default function Layout({ children }) {
  return children;
}
