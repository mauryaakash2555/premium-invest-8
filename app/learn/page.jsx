'use client';

import { useEffect } from 'react';

import AskFirstInfiniteLearning from './AskFirstInfiniteClient';

export default function LearnPage() {
  useEffect(() => {
    // Scope the laser theme (scrollbars, dock rules, etc.) to the learning sanctuary.
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-laser-active', 'true');
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-laser-active', 'true');
    }

    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeAttribute('data-laser-active');
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.removeAttribute('data-laser-active');
      }
    };
  }, []);

  return <AskFirstInfiniteLearning />;
}
