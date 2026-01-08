'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

// Store Lenis instance globally so other components can access it
if (typeof window !== 'undefined') {
  (window as any).lenisInstance = null;
}

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,        // inertia strength
      smoothWheel: true,
      smoothTouch: false,
      easing: (t) =>
        Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    // Store instance globally
    if (typeof window !== 'undefined') {
      (window as any).lenisInstance = lenis;
    }

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      if (typeof window !== 'undefined') {
        (window as any).lenisInstance = null;
      }
    }
  }, [])

  return null
}
