import { redirect } from 'next/navigation';

/**
 * Redirect from /live-intel to /live-intelligence
 * This helps with SEO by ensuring consistent URLs
 */
export default function LiveIntelRedirect() {
  redirect('/live-intelligence');
}
