export const metadata = {
  title: 'Investment Services Mumbai - Mutual Funds, SIP, Insurance, PMS | BM Wealth',
  description: 'Comprehensive investment services in Mumbai: Mutual Funds, SIP, PMS, Insurance, Trading & Fixed Deposits. Expert financial planning by BM Wealth ARN 90008.',
  keywords: 'investment services Mumbai, mutual funds advisor, SIP plans, portfolio management Mumbai, insurance Mumbai, trading services, fixed deposits',
  alternates: {
    canonical: 'https://www.bmwealth.co.in/services',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.bmwealth.co.in/services',
    title: 'Investment Services Mumbai | BM Wealth',
    description: 'Comprehensive investment services: Mutual Funds, SIP, PMS, Insurance, Trading & Fixed Deposits.',
    images: ['https://www.bmwealth.co.in/logo.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Investment Services Mumbai | BM Wealth',
    description: 'Comprehensive investment services: Mutual Funds, SIP, PMS, Insurance, Trading & Fixed Deposits.',
    images: ['https://www.bmwealth.co.in/logo.webp'],
  },
};

export default function ServicesLayout({ children }) {
  return <>{children}</>;
}



