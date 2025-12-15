"use client";

import PreLoader from "@/components/Common/PreLoader";
import ScrollToTop from "@/components/Common/ScrollToTop";
import CacheRefreshButton from "@/components/Common/CacheRefreshButton";
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
    <html lang="en" className="font-inter" suppressHydrationWarning>
      <body>
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
            <ScrollToTop />
            <CacheRefreshButton />
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}

