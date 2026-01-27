import { buildMetadata } from '@/lib/seo/metadata';
import { permanentRedirect } from "next/navigation";

export const metadata = buildMetadata({
  title: 'Refund Policy (Legacy) | BM Wealth',
  description: 'Legacy URL. Redirects to the canonical refund page.',
  path: '/refund-policy',
  robots: { index: false, follow: false },
});

export default function RefundPolicyLegacyPage() {
  permanentRedirect("/refund");
}
