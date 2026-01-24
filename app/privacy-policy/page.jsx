import { buildMetadata } from '@/lib/seo/metadata';
import { redirect } from "next/navigation";

export const metadata = buildMetadata({
  title: 'Privacy Policy (Legacy) | BM Wealth',
  description: 'Legacy URL. Redirects to the canonical privacy page.',
  path: '/privacy-policy',
  robots: { index: false, follow: false },
});

export default function PrivacyPolicyLegacyPage() {
  redirect("/privacy");
}
