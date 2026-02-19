import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Onboarding | Client Portal | BM Wealth",
  description: "Complete your investor onboarding steps — KYC, PAN verification, and investment setup.",
  path: "/client-portal/onboarding",
  robots: { index: false, follow: false },
});

export default function PortalOnboardingLayout({ children }) {
  return children;
}
