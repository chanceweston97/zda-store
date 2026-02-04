import { Metadata } from "next";
import Solutions from "@/components/Solutions";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Industry RF Solutions | ZDA Communications",
  description:
    "RF connectivity solutions for DAS, public safety/ERRCS, SCADA & industrial telemetry, wildlife tracking, and private LTE/5G—antennas, coax, and RF components.",
  openGraph: {
    title: "Industry Solutions | ZDA Communications",
    description:
      "Support for integrators across in-building DAS, ERRCS, utilities/SCADA, tracking networks, and private cellular—built on a clean, consistent RF chain.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Industry Solutions | ZDA Communications",
    description:
      "Support for integrators across in-building DAS, ERRCS, utilities/SCADA, tracking networks, and private cellular—built on a clean, consistent RF chain.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const SolutionsPage = () => {
  return (
    <>
      <Solutions />
    </>
  );
};

export default SolutionsPage;
