import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Best Credit Cards India | BM Wealth',
  description:
    'Compare leading credit cards in India with a practical lens on rewards, travel, fees, and suitability for working professionals.',
  path: '/best-credit-cards-india',
});

export default function Layout({ children }) {
  return children;
}
