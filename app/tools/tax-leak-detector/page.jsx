import { buildMetadata } from '@/lib/seo/metadata';
import { redirect } from "next/navigation";

export const metadata = buildMetadata({
  title: 'Tax Leak Detector (Legacy) | BM Wealth',
  description: 'Legacy tool URL. Redirects to Tax Optimization Intelligence.',
  path: '/tools/tax-leak-detector',
  robots: { index: false, follow: false },
});

export default function TaxLeakDetectorToolPage() {
  redirect("/tools/tax-optimization");
}
