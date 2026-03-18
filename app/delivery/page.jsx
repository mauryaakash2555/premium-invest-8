import { permanentRedirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Delivery Information | BM Wealth",
  description: "Delivery and fulfillment information for BM Wealth digital store products.",
  path: "/delivery",
});

export default function DeliveryRedirectPage() {
  permanentRedirect("https://store.bmwealth.co.in/delivery");
}
