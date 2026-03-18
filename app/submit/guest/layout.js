import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Guest Post Submission | BM Wealth',
  description:
    'Submit a guest article for editorial review on BM Wealth covering finance, investing, or professional money decisions.',
  path: '/submit/guest',
});

export default function Layout({ children }) {
  return children;
}
