import { buildMetadata } from "@/lib/seo/metadata";
import BlueprintClient from "./BlueprintClient";

const PATH = "/blueprint";

export const metadata = {
  ...buildMetadata({
    title: "Your Wealth Planning Blueprint | BM Wealth",
    description:
      "A structured starting point for serious investors — understand SIP, PMS, and common mistakes before making any decision.",
    path: PATH,
  }),
};

export default function BlueprintPage() {
  return <BlueprintClient />;
}
