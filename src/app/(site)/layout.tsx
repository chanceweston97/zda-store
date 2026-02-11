import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./Providers";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      {children}
      <Footer />
    </Providers>
  );
}
