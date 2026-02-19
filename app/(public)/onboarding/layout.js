import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "Check Mutual Fund KYC Status | PAN Aadhaar Link | KRA Verification Online | BM Wealth",
  description:
    "Free step-by-step guide to check PAN Aadhaar link status, mutual fund KYC verification, KRA validation, and name mismatch resolution. Start SIP or investing in mutual funds in India.",
  path: "/onboarding",
});

export default function OnboardingLayout({ children }) {
  return children;
}
