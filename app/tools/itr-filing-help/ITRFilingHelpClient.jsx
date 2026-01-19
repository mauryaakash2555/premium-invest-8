'use client';

import dynamic from 'next/dynamic';

const ITRFilingHelp = dynamic(() => import('@/components/tools/ITRFilingHelp'), {
  ssr: false,
});

export default function ITRFilingHelpClient() {
  return <ITRFilingHelp />;
}
