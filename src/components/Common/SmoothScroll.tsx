'use client'

import { useEffect, useRef } from 'react'

if (typeof window !== 'undefined') {
  (window as any).lenisInstance = null;
}

export default function SmoothScroll() {
  const rafIdRef = useRef<number>(0);
  const lenisRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const start = () => {
      if (cancelledRef.current) return;
      import('lenis').then(({ default: Lenis }) => {
        if (cancelledRef.current) return;
        const lenis = new Lenis({
          duration: 0.8,
          smoothWheel: true,
          smoothTouch: false,
          wheelMultiplier: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        lenisRef.current = lenis;
        if (typeof window !== 'undefined') {
          (window as any).lenisInstance = lenis;
        }
        function raf(time: number) {
          if (lenisRef.current) {
            lenisRef.current.raf(time);
            rafIdRef.current = requestAnimationFrame(raf);
          }
        }
        rafIdRef.current = requestAnimationFrame(raf);
      });
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(start, { timeout: 2000 });
      return () => {
        cancelledRef.current = true;
        cancelIdleCallback(id);
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
          if (typeof window !== 'undefined') (window as any).lenisInstance = null;
        }
      };
    }
    const t = setTimeout(start, 300);
    return () => {
      cancelledRef.current = true;
      clearTimeout(t);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        if (typeof window !== 'undefined') (window as any).lenisInstance = null;
      }
    };
  }, []);

  return null;
}
