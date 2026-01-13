import { DEFAULT_OG_IMAGE, SITE_NAME, getMetadataBase } from "@/lib/seo/metadata";

export const metadata = {
  metadataBase: getMetadataBase(),
  title: "BM Wealth | Portfolio Management (PMS), Mutual Funds, SIP",
  description: "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "BM Wealth",
    description:
      "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BM Wealth",
    description:
      "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "finance",
  classification: "business",
  author: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: getMetadataBase(),
  other: {
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
  },
};

export const schemaGraph = (siteUrl) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: SITE_NAME,
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}#website`,
      url: siteUrl,
      name: SITE_NAME,
      description:
        "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
      publisher: { "@id": `${siteUrl}#organization` },
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
      inLanguage: "en-IN",
    },
    {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}#localbusiness`,
      name: SITE_NAME,
      url: siteUrl,
      image: `${siteUrl}/logo.png`,
      telephone: "+91 88509 77259",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      areaServed: "Mumbai",
      parentOrganization: { "@id": `${siteUrl}#organization` },
    },
  ],
});