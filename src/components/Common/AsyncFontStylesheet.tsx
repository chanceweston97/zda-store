"use client";

import { useEffect } from "react";

const FONT_CSS_URL = "https://fonts.cdnfonts.com/css/general-sans";

/**
 * Loads General Sans font CSS only after the page has loaded so it never
 * appears in the critical path. PageSpeed/Lighthouse will not count it
 * as a render-blocking request.
 */
export default function AsyncFontStylesheet() {
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let link: HTMLLinkElement | null = null;

    const injectFont = () => {
      if (cancelled) return;
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = FONT_CSS_URL;
      link.media = "print"; // Prevent blocking; switch to "all" after load
      link.onload = () => {
        if (link) link.media = "all";
      };
      document.head.appendChild(link);
    };

    let loadHandler: (() => void) | null = null;
    let idleId: number | null = null;

    const doInject = () => {
      if (typeof requestIdleCallback !== "undefined") {
        idleId = requestIdleCallback(injectFont, { timeout: 1500 });
      } else {
        timeoutId = setTimeout(injectFont, 300);
      }
    };

    if (document.readyState === "complete") {
      doInject();
    } else {
      loadHandler = () => doInject();
      window.addEventListener("load", loadHandler);
    }

    return () => {
      cancelled = true;
      if (loadHandler) window.removeEventListener("load", loadHandler);
      if (timeoutId) clearTimeout(timeoutId);
      if (idleId && typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId);
      if (link?.parentNode) link.remove();
    };
  }, []);

  return null;
}
