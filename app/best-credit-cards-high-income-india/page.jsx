import { buildMetadata } from '@/lib/seo/metadata';
import { permanentRedirect } from "next/navigation";

export const metadata = buildMetadata({
  title: 'Best Credit Cards (Legacy) | BM Wealth',
  description: 'Legacy URL. Redirects to the canonical blog post.',
  path: '/best-credit-cards-high-income-india',
  robots: { index: false, follow: false },
});

export default function BestCreditCardsHighIncomeIndiaPage() {
  permanentRedirect("/blog/best-credit-cards-high-income-india");
}
