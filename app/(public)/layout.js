import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "BM Wealth | Portfolio Management (PMS), Mutual Funds, SIP",
  description:
    "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
  path: "/",
      robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      authors: [{ name: "BM Wealth" }],
      creator: "BM Wealth",
      publisher: "BM Wealth",
      keywords: "portfolio management, mutual funds, SIP, insurance, trading, wealth management, financial advisor Mumbai",
      openGraph: {
              type: "website",
              locale: "en_IN",
              url: "https://bmwealth.co.in",
              siteName: "BM Wealth",
              images: [{ url: "https://bmwealth.co.in/og-image.png", width: 1200, height: 630, alt: "BM Wealth" }],
      },
      twitter: {
              card: "summary_large_image",
              site: "@bmwealth",
              creator: "@bmwealth",
      },
      icons: {
              icon: "/favicon.ico",
              apple: "/apple-touch-icon.png",
      },
      metadataBase: new URL("https://bmwealth.co.in")
})

export default function Layout({ children }) {
    return (
            <>
{children}
</>
    );
        }
