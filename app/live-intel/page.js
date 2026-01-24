import { redirect } from 'next/navigation';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Live Intelligence (Legacy) | BM Wealth',
  description: 'Legacy URL. Redirects to /live-intelligence.',
  path: '/live-intel',
  robots: { index: false, follow: false },
});

/**
 * Redirect from /live-intel to /live-intelligence
 * This helps with SEO by ensuring consistent URLs
 */
export default function LiveIntelRedirect() {
  redirect('/live-intelligence');
}
