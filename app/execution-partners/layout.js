import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Execution Partners (Optional) | BM Wealth',
  description:
    'A neutral routing page for optional execution. Integrations may be unavailable while reviewed. No hype, no promises.',
  path: '/execution-partners',
});

export default function ExecutionPartnersLayout({ children }) {
  return children;
}
