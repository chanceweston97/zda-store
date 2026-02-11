import "./css/style.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZDA Communications",
  description:
    "Industrial-grade antennas, coaxial cable assemblies, and RF components.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
