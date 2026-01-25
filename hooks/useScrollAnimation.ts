'use client';

import { RefObject, useEffect } from 'react';
import { useAnimation } from './useAnimation';

type Options = {
  rootMargin?: string;
  once?: boolean;
  animateClassName?: string;
};

export function useScrollAnimation<T extends HTMLElement>(
  ref: RefObject<T>,
  { rootMargin = '120px', once = true, animateClassName = 'animate-in' }: Options = {}
) {
  const { prefersReducedMotion } = useAnimation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      el.classList.add(animateClassName);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add(animateClassName);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(animateClassName);
          if (once) obs.unobserve(entry.target);
        });
      },
      { rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin, once, animateClassName, prefersReducedMotion]);
}
