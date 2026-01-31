import PillarIndexClient from "../PillarIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Guest Columns | BM Wealth",
  description: "Expert perspectives from verified professionals.",
  path: "/blog/guest",
});

export default function BlogGuestPage() {
  return <PillarIndexClient pillar="GUEST" />;
}
