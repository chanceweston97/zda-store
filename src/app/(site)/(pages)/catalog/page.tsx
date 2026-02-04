import { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import CatalogButton from "./CatalogButton";

export const metadata: Metadata = {
  title: "Product Catalog | ZDA Communications",
  description:
    "ZDA's comprehensive RF product catalog consisting of antennas, RF cabling, and components.",
  openGraph: {
    title: "Product Catalog | ZDA Communications",
    description: "A complete catalog of antennas, RF cabling, and RF components.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Catalog | ZDA Communications",
    description: "A complete catalog of antennas, RF cabling, and RF components.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const CatalogPage = () => {
  return (
    <>
      <div className="py-20 min-h-[70vh] flex items-center justify-center pt-[100px]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            {/* Coming Soon Badge */}
            <div className="mb-8">
              <span 
                className="inline-block px-6 py-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(41, 88, 164, 0.1)',
                  color: '#2958A4',
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '-0.28px'
                }}
              >
                COMING SOON
              </span>
            </div>

            {/* Main Heading */}
            <h1 
              className="mb-6"
              style={{
                color: '#000',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '60px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '72px',
                letterSpacing: '-2.4px'
              }}
            >
              Product Catalog
            </h1>

            {/* Description */}
            <p 
              className="mb-12"
              style={{
                color: '#383838',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '28px',
                letterSpacing: '-0.36px'
              }}
            >
              Our comprehensive product catalog is currently being prepared. 
              We're working hard to bring you detailed information about all our antennas, 
              cables, connectors, and RF accessories.
            </p>

            {/* CTA Button */}
            <div className="mb-8">
              <CatalogButton />
            </div>

            {/* Additional Info */}
            <p 
              style={{
                color: '#6B7280',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '22px',
                letterSpacing: '-0.28px'
              }}
            >
              In the meantime, browse our{" "}
              <Link 
                href="/products" 
                className="underline hover:no-underline transition-all"
                style={{ color: '#2958A4' }}
              >
                online products
              </Link>{" "}
              to view our available products.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogPage;
