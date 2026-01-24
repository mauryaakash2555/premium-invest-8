import { DEFAULT_OG_IMAGE, SITE_NAME, getMetadataBase } from "@/lib/seo/metadata";

export const metadata = {
  metadataBase: getMetadataBase(),
  title: "BM Wealth - Portfolio Management, Mutual Funds & SIP Investments",
  description:
    "BM Wealth offers premium portfolio management, mutual funds, SIP and insurance solutions for high-income investors in Mumbai. Trusted advisory, simplified execution.",
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
    title: "BM Wealth - Portfolio Management, Mutual Funds & SIP Investments",
    description:
      "BM Wealth offers premium portfolio management, mutual funds, SIP and insurance solutions for high-income investors in Mumbai. Trusted advisory, simplified execution.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BM Wealth - Portfolio Management, Mutual Funds & SIP Investments",
    description:
      "BM Wealth offers premium portfolio management, mutual funds, SIP and insurance solutions for high-income investors in Mumbai. Trusted advisory, simplified execution.",
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
  // Set Google Search Console verification via deployment config if needed.
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
      sameAs: [
        "https://twitter.com/bmwealth",
        "https://linkedin.com/company/bmwealth",
        "https://facebook.com/bmwealth",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: "+91 88509 77259",
          email: "support@bmwealth.co.in",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "66, Vinod Villa Bldg., 1st Floor, Office 108, Cavel Cross Lane 3, Kalbadevi",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        postalCode: "400002",
        addressCountry: "IN",
      },
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
      email: "support@bmwealth.co.in",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      areaServed: "Mumbai",
      parentOrganization: { "@id": `${siteUrl}#organization` },
    },

    {
      "@type": "FinancialService",
      "@id": `${siteUrl}#financialservice`,
      name: "BM Wealth",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      telephone: "+91 88509 77259",
      email: "support@bmwealth.co.in",
      areaServed: {
        "@type": "City",
        name: "Mumbai",
      },
      provider: { "@id": `${siteUrl}#organization` },
      serviceType: [
        "Portfolio Management (PMS)",
        "Mutual Funds",
        "SIP",
        "Insurance",
        "Fixed Deposits",
        "Trading & Demat Support",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "BM Wealth Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Portfolio Management",
              url: `${siteUrl}/portfolio-management`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Mutual Funds",
              url: `${siteUrl}/mutual-funds`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Insurance",
              url: `${siteUrl}/insurance`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Fixed Deposits",
              url: `${siteUrl}/fixed-deposits`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Live Intelligence",
              url: `${siteUrl}/live-intelligence`,
            },
          },
        ],
      },
    },
  ],
});