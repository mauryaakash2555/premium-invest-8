'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function LearnBodyClass() {
  useEffect(() => {
    try {
      document.documentElement?.classList?.add('learn-universe');
      document.body?.classList?.add('learn-universe');
    } catch {
      // ignore
    }

    return () => {
      try {
        document.documentElement?.classList?.remove('learn-universe');
        document.body?.classList?.remove('learn-universe');
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <Script id="learn-body-class" strategy="beforeInteractive">
      {`(function(){try{document.documentElement.classList.add('learn-universe'); if(document.body){document.body.classList.add('learn-universe');}}catch(e){}})();`}
    </Script>
  );
}
