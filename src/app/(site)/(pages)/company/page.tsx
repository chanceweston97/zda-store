import { Metadata } from "next";
import Company from "@/components/Company";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Industrial-grade RF Solutions | Company | ZDA Communications",
  description:
    "ZDA Communications designs and supplies RF antennas, coaxial cable assemblies, and components for industrial, public safety, and infrastructure networks.",
  openGraph: {
    title: "Built to Connect | ZDA Communications",
    description:
      "Industrial-grade RF components engineered for predictable coverage, reliable signal transmission, and long-term system performance.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Built to Connect | ZDA Communications",
    description:
      "Industrial-grade RF components engineered for predictable coverage, reliable signal transmission, and long-term system performance.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const CompanyPage = () => {
  return (
    <>
      <Company />
    </>
  );
};

export default CompanyPage;
