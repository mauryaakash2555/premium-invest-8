import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Disclaimer | BM Wealth',
  description:
    'Read BM Wealth’s investment and website disclaimer, including market risk disclosures and informational limitations.',
  path: '/disclaimer',
});

export default function Layout({ children }) {
  return <>{children}</>;
}
