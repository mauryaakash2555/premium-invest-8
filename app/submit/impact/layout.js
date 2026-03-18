import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Impact Story Submission | BM Wealth',
  description:
    'Submit a real-world impact story or financial case study for review by the BM Wealth editorial team.',
  path: '/submit/impact',
});

export default function Layout({ children }) {
  return children;
}
