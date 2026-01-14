
export const metadata = {
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
      metadataBase: new URL("https://bmwealth.co.in"),
};

  // Structured Data for Organization and Financial Services
  export const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BM Wealth",
    "url": "https://bmwealth.co.in",
    "logo": "https://bmwealth.co.in/og-image.png",
    "description": "Premium portfolio management (PMS) and wealth services across mutual funds, SIP, insurance, trading & demat",
    "sameAs": [
          "https://twitter.com/bmwealth",
          "https://linkedin.com/company/bmwealth",
          "https://facebook.com/bmwealth"
        ],
    "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "telephone": "+91-XXXXXXXXXX",
          "email": "support@bmwealth.co.in"
    },
    "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressLocality": "Mumbai"
    },
    "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "description": "Portfolio Management Services, Mutual Funds, SIP, Insurance, Trading, Demat"
    }
};

// SEO Configuration for Canonical URLs and Verification
export const seoConfig = {
    canonical: "https://bmwealth.co.in",
    language: "en-IN",
    googleSiteVerification: "add-your-google-verification-code",
    bingSiteVerification: "add-your-bing-verification-code",
    preferredUrl: "https://bmwealth.co.in",
    // Performance & Core Web Vitals
    preloadFonts: true,
    preloadImages: true,
    lazyLoadImages: true,
    // Sitemap and Robots configuration
    sitemap: "https://bmwealth.co.in/sitemap.xml",
    robotsTxt: "https://bmwealth.co.in/robots.txt"
};

// Accessibility and Social Media Configuration
export const accessibilityConfig = {
    lang: "en",
    direction: "ltr",
    // ARIA and Accessibility
    skipNavLinks: true,
    ariaLabels: {
          navigation: "Main Navigation",
          footer: "Footer Navigation",
          search: "Site Search",
          contactForm: "Contact Form"
    },
    // Social Media and Sharing
    socialSharing: {
          twitter: "@bmwealth",
          linkedin: "bmwealth",
          facebook: "bmwealth",
          instagram: "bmwealth"
    },
    // Mobile and Responsive
    mobileOptimized: true,
    viewport: "width=device-width, initial-scale=1.0",
    colorScheme: "light",
    // Content Language and Alternatives
    alternateLanguages: [
      { lang: "hi", url: "https://bmwealth.co.in/hi/" },
      { lang: "ma", url: "https://bmwealth.co.in/mr/" }
        ]
};
})

export default function Layout({ children }) {
    return (
            <>
{children}
</>
    );
        }
