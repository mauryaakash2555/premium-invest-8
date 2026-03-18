import { permanentRedirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Learn Finance | BM Wealth',
  description: 'Structured learning hubs for finance, investing, taxation, and wealth-building concepts.',
  path: '/learn',
});

export default function LearnPage() {
  permanentRedirect('/universe');
}
