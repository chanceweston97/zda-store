import "./css/style.css";
import type { Metadata } from "next";
import SmoothScroll from "@/components/Common/SmoothScroll";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "ZDA Communications",
  description:
    "Industrial-grade antennas, coaxial cable assemblies, and RF components.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload LCP image (hero) so it starts loading immediately */}
        <link
          rel="preload"
          href="/images/hero/banner.webp"
          as="image"
        />
      </head>
      <body>
        <GoogleAnalytics />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
