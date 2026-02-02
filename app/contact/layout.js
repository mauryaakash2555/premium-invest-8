import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Contact BM Wealth | Mumbai | WhatsApp & Consultation',
  description:
    'Contact BM Wealth for a consultation. Share your goals and constraints and receive a documentation-first, suitability-led next step.',
  path: '/contact',
});

export default function Layout({ children }) {
  return <>{children}</>;
}