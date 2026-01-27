import { buildMetadata } from '@/lib/seo/metadata';
import { permanentRedirect } from "next/navigation";

export const metadata = buildMetadata({
  title: 'Terms (Legacy) | BM Wealth',
  description: 'Legacy URL. Redirects to the canonical terms page.',
  path: '/terms-and-conditions',
  robots: { index: false, follow: false },
});

export default function TermsAndConditionsLegacyPage() {
  permanentRedirect("/terms");
}
