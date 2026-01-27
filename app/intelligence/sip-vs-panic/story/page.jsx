import { buildMetadata } from "@/lib/seo/metadata";

import StoryLandingShell from "@/intelligence/ui/sip-panic/StoryLandingShell";

const PATH = "/intelligence/sip-vs-panic/story";

export const metadata = buildMetadata({
  title: "SIP Crash Story Simulator (2 minutes) | BM Wealth",
  description:
    "A fast, education-only Story Mode: choose what you’d do in a crash and instantly see the post-tax cost of panic vs discipline. Shareable results.",
  path: PATH,
  type: "website",
});

export default function SipVsPanicStoryPage() {
  return <StoryLandingShell />;
}
