"use client";
import React, { useState, useEffect } from "react";

const PreLoader = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Minimal delay so LCP isn’t blocked; remove or set to 0 for best PageSpeed
    const t = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    loading && (
      <div className="fixed left-0 top-0 z-999999 flex h-screen w-screen items-center justify-center bg-white">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#2958A4] border-t-transparent"></div>
      </div>
    )
  );
};

export default PreLoader;
