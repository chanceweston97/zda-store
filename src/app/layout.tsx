"use client";

import PreLoader from "@/components/Common/PreLoader";
import ScrollToTop from "@/components/Common/ScrollToTop";
import CacheRefreshButton from "@/components/Common/CacheRefreshButton";
import SmoothScroll from "@/components/Common/SmoothScroll";
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
  const isSolutionsPage = pathname === "/solutions";

  return (
    <html lang="en" className="font-inter scroll-smooth" suppressHydrationWarning>
      <head>
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

          <div className={isSolutionsPage ? "" : "max-md:pb-20 max-md:pr-14"}>
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

