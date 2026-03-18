import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Live Intelligence | BM Wealth',
  description: 'Live market intelligence, context, and execution-focused financial insights from BM Wealth.',
  path: '/live',
});

export default function LiveAliasPage() {
  redirect('/live-intelligence');
}
