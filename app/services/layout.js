import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Wealth Services | PMS, Mutual Funds, SIP & Insurance | BM Wealth',
  description:
    'Explore BM Wealth services: mutual funds, SIP execution, insurance, fixed deposits, and demat/trading support — delivered with a process-first approach.',
  path: '/services',
});

export default function Layout({ children }) {
  return <>{children}</>;
}