"use client";

import { useEffect } from "react";

const FONT_CSS_URL = "https://fonts.cdnfonts.com/css/general-sans";

/**
 * Loads General Sans font CSS asynchronously so it does not block LCP/FCP.
 * PageSpeed: removes render-blocking request from cdnfonts.com.
 */
export default function AsyncFontStylesheet() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = FONT_CSS_URL;
    link.onload = () => {
      link.onload = null;
      link.rel = "stylesheet";
    };
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  return null;
}
