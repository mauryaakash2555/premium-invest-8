import { redirect } from 'next/navigation';

/**
 * Calculator Share Page with Dynamic OG Meta
 * 
 * URL: /tools/calc-share?c=sip&title=...&desc=...
 * 
 * This page handles shared calculator links and generates
 * dynamic Open Graph meta tags for nice link previews.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmwealth.co.in';

// Calculator labels for generating titles
const CALC_LABELS = {
  insurance: 'Insurance Calculator',
  sip: 'SIP Calculator',
  mfReturns: 'Mutual Fund Calculator',
  lic: 'LIC Calculator',
  lumpsum: 'Lumpsum Calculator',
  goal: 'Goal Planning Calculator',
  retire: 'Retirement Calculator',
  fd: 'FD Calculator',
  ppf: 'PPF Calculator',
  epf: 'EPF Calculator',
  nps: 'NPS Calculator',
  elss: 'ELSS Calculator',
  emi: 'EMI Calculator',
  swp: 'SWP Calculator',
  stepup: 'Step-Up SIP Calculator',
  cagr: 'CAGR Calculator',
  inflation: 'Inflation Calculator',
  gratuity: 'Gratuity Calculator',
  hra: 'HRA Calculator',
  tax: 'Income Tax Calculator',
  rd: 'RD Calculator',
  ssy: 'SSY Calculator',
  wealth: 'Wealth Growth Calculator',
  childPlan: 'Child Education Calculator',
  marriage: 'Marriage Fund Calculator',
  carLoan: 'Car Loan Calculator',
  homeLoan: 'Home Loan Calculator',
  gold: 'Gold Investment Calculator',
};

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const calc = params?.c || 'sip';
  const title = params?.title 
    ? decodeURIComponent(params.title)
    : `${CALC_LABELS[calc] || 'Financial Calculator'} Results | BM Wealth`;
  const description = params?.desc
    ? decodeURIComponent(params.desc)
    : `View this prefilled ${CALC_LABELS[calc] || 'financial'} calculation from BM Wealth. Tap to open and adjust inputs.`;

  // Use the main logo for OG image - it's always available
  const ogImage = `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      siteName: 'BM Wealth',
      type: 'website',
      locale: 'en_IN',
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CalcSharePage({ searchParams }) {
  // Get search params and redirect to the actual calculator page
  const params = await searchParams;
  const targetParams = new URLSearchParams();
  
  // Copy all params except title and desc (which were for OG only)
  for (const [key, value] of Object.entries(params || {})) {
    if (key !== 'title' && key !== 'desc') {
      targetParams.set(key, value);
    }
  }

  const targetUrl = `/tools/all-calculators?${targetParams.toString()}`;
  redirect(targetUrl);
}
