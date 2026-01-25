import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Partners | BM Wealth',
  description:
    'A single partner hub for execution options, platform integrations under review, and partnership requests.',
  path: '/partners',
});

export default function PartnersLayout({ children }) {
  return children;
}
