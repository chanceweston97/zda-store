"use client";

import { useEffect } from "react";

export default function MomentumScroll() {
  useEffect(() => {
    let isScrolling = false;
    let scrollVelocity = 0;
    let lastScrollTop = 0;
    let lastTime = Date.now();
    let animationFrame: number | null = null;

    const handleScroll = () => {
      const currentTime = Date.now();
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0) {
        scrollVelocity = (currentScrollTop - lastScrollTop) / deltaTime;
      }
      
      lastScrollTop = currentScrollTop;
      lastTime = currentTime;
      isScrolling = true;

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => {
        isScrolling = false;
        startInertia();
      }, 150);
    };

    const startInertia = () => {
      if (Math.abs(scrollVelocity) < 0.1) {
        scrollVelocity = 0;
        return;
      }

      const animate = () => {
        if (isScrolling) {
          scrollVelocity = 0;
          return;
        }

        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        scrollVelocity *= 0.92;

        if (Math.abs(scrollVelocity) < 0.1) {
          scrollVelocity = 0;
          return;
        }

        const newScrollTop = currentScrollTop + scrollVelocity * 16;
        const clampedScroll = Math.max(0, Math.min(newScrollTop, maxScroll));

        if (clampedScroll === currentScrollTop || clampedScroll <= 0 || clampedScroll >= maxScroll) {
          scrollVelocity = 0;
          return;
        }

        window.scrollTo(0, clampedScroll);

        if (Math.abs(scrollVelocity) > 0.1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          scrollVelocity = 0;
        }
      };

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    lastTime = Date.now();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      clearTimeout((window as any).scrollTimeout);
    };
  }, []);

  return null;
}
