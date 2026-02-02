import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Wealth Services | PMS, Mutual Funds, SIP & Insurance | BM Wealth',
  description:
    'Explore BM Wealth services: portfolio management (PMS support), mutual funds, SIP execution, insurance, fixed deposits, and trading & demat support — delivered with a process-first approach.',
  path: '/services',
});

export default function Layout({ children }) {
  return <>{children}</>;
}