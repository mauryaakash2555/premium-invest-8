import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "BM Wealth | Portfolio Management (PMS), Mutual Funds, SIP",
  description:
    "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
  path: "/",
});

export default function Layout({ children }) {
    return (
            <>
{children}
</>
    );
        }
