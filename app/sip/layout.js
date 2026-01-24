import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "SIP (Systematic Investment Plan) | BM Wealth",
  description:
    "Start your SIP journey with BM Wealth in Mumbai. Goal-based SIP planning, fund selection frameworks and long-term portfolio discipline.",
  path: "/sip",
});

export default function Layout({ children }) {
  return children;
}
