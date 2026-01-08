"use client";

import PreLoader from "@/components/Common/PreLoader";
import ScrollToTop from "@/components/Common/ScrollToTop";
import CacheRefreshButton from "@/components/Common/CacheRefreshButton";
import SmoothScroll from "@/components/Common/SmoothScroll";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
      <body id="lenis-root">
        {!isAdminRoute && <PreLoader />}

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

          {children}
        </Providers>

        {!isAdminRoute && (
          <>
            <SmoothScroll />
            <ScrollToTop />
            <CacheRefreshButton />
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}

