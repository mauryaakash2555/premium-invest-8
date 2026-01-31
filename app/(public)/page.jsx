import HomePageClient from './HomePageClient';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'BM Wealth - Portfolio Management, Mutual Funds & SIP Investments',
  description:
    'BM Wealth offers premium portfolio management, mutual funds, SIP and insurance solutions for high-income investors in Mumbai. Trusted advisory, simplified execution.',
  path: '/',
  type: 'website',
});

export default function HomePage() {
  return <HomePageClient />;
}








