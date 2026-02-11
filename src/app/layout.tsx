"use client";

import PreLoader from "@/components/Common/PreLoader";
import ScrollToTop from "@/components/Common/ScrollToTop";
import CacheRefreshButton from "@/components/Common/CacheRefreshButton";
import SmoothScroll from "@/components/Common/SmoothScroll";
import AsyncFontStylesheet from "@/components/Common/AsyncFontStylesheet";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Script from "next/script";
import "./css/style.css";
import Providers from "./(site)/Providers";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="en" className="font-inter scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Preload critical font for LCP / FCP (PageSpeed) */}
        <link
          rel="preload"
          href="/fonts/Satoshi-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Google Tag (Ads + Analytics): single gtag.js load, then config both */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17872973606"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17872973606');
            ${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? `gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { page_path: window.location.pathname });` : ""}
          `}
        </Script>
      </head>
      <body id="lenis-root">
        <AsyncFontStylesheet />
        <noscript>
          <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/general-sans" />
        </noscript>
        {!isAdminRoute && <PreLoader />}
        
        {/* Track route changes for GA */}
        <GoogleAnalytics />

        <Providers>
          {!isAdminRoute && (
            <NextTopLoader
              color="#2958A4"
              crawlSpeed={300}
              showSpinner={false}
              shadow="none"
            />
          )}

          {!isAdminRoute && <Header />}

          <Toaster position="top-center" reverseOrder={false} />

          <div>
            {children}

            {!isAdminRoute && (
            <>
              <SmoothScroll />
              <ScrollToTop />
              <CacheRefreshButton />
              <Footer />
            </>
          )}
          </div>
        </Providers>
      </body>
    </html>
  );
}

