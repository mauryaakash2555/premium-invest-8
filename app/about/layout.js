/**
 * FILE: app\about\layout.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - (none)
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

export const metadata = {
  title: 'About BM Wealth - Led by Brahmdeo Maurya | Mumbai Investment Advisory ARN 90008',
  description: 'Learn about BM Wealth and founder Brahmdeo Maurya. IRDAI Licensed and AMFI Registered ARN 90008 providing expert financial planning and wealth management in Mumbai.',
  keywords: 'Brahmdeo Maurya, BM Wealth about, investment advisor Mumbai, ARN 90008, IRDAI licensed, AMFI registered, financial planner Mumbai',
  alternates: {
    canonical: 'https://www.bmwealth.co.in/about',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.bmwealth.co.in/about',
    title: 'About BM Wealth - Led by Brahmdeo Maurya',
    description: 'IRDAI Licensed and AMFI Registered ARN 90008 providing expert financial planning in Mumbai.',
    images: ['https://www.bmwealth.co.in/logo.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About BM Wealth - Led by Brahmdeo Maurya',
    description: 'IRDAI Licensed and AMFI Registered ARN 90008 providing expert financial planning in Mumbai.',
    images: ['https://www.bmwealth.co.in/logo.webp'],
  },
};

export default function AboutLayout({ children }) {
  return <>{children}</>;
}



