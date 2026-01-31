'use client';

import dynamic from 'next/dynamic';

const ITRWorkbench = dynamic(() => import('@/components/ITR/ITRWorkbench'), {
  ssr: false,
});

export default function ITRFilingHelpClient() {
  return <ITRWorkbench />;
}
