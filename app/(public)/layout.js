export const metadata = {
      title: "BM Wealth | Portfolio Management (PMS), Mutual Funds, SIP",
      description:
            "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
      robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      authors: [{ name: "BM Wealth" }],
      creator: "BM Wealth",
      publisher: "BM Wealth",
      keywords:
            "portfolio management, mutual funds, SIP, insurance, trading, wealth management, financial advisor Mumbai",
      openGraph: {
            type: "website",
            locale: "en_IN",
            url: "https://bmwealth.co.in",
            siteName: "BM Wealth",
            images: [
                  {
                        url: "https://bmwealth.co.in/og-image.png",
                        width: 1200,
                        height: 630,
                        alt: "BM Wealth",
                  },
            ],
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
      metadataBase: new URL("https://bmwealth.co.in"),
};

// Structured Data for Organization and Financial Services (JSON-LD)
const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "BM Wealth",
      url: "https://bmwealth.co.in",
      logo: "https://bmwealth.co.in/og-image.png",
      description:
            "Premium portfolio management (PMS) and wealth services across mutual funds, SIP, insurance, trading & demat",
      sameAs: [
            "https://twitter.com/bmwealth",
            "https://linkedin.com/company/bmwealth",
            "https://facebook.com/bmwealth",
      ],
      contactPoint: {
            "@type": "ContactPoint",
            contactType: "Customer Service",
            telephone: "+91-XXXXXXXXXX",
            email: "support@bmwealth.co.in",
      },
      address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
            addressLocality: "Mumbai",
      },
      offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            description: "Portfolio Management Services, Mutual Funds, SIP, Insurance, Trading, Demat",
      },
};

export default function Layout({ children }) {
      return (
            <>
                  <script
                        type="application/ld+json"
                        // JSON-LD must be a string
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                  />
                  {children}
            </>
      );
}
