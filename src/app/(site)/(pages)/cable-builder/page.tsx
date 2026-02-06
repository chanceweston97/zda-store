import { CableCustomizerClient } from "@/components/CableCustomizer";
import { getCableSeries, getCableTypes, getConnectors, imageBuilder } from "@/lib/data/shop-utils";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "RF Coaxial Cable Builder | LMR & RG Assemblies | ZDA",
  description:
    "Build RF coaxial cable assemblies fast—LMR-equivalent and RG series cut to length with 4.3-10, N-Type, SMA and other terminations. Request a quote.",
  openGraph: {
    title: "RF Coaxial Cable Builder | ZDA Communications",
    description:
      "Configure cut-to-length RF coaxial cable assemblies using LMR-equivalent and RG series cable with 4.3-10, N-Type, SMA, and other connector terminations.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RF Coaxial Cable Builder | ZDA Communications",
    description:
      "Configure cut-to-length RF coaxial cable assemblies using LMR-equivalent and RG series cable with 4.3-10, N-Type, SMA, and other connector terminations.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const CableCustomizerPage = async () => {
  // Cable Builder uses LOCAL DATA ONLY
  // Data is stored in frontend/src/lib/data/cable-customizer-data.ts
  const [cableSeries, cableTypes, connectors] = await Promise.all([
    getCableSeries(),
    getCableTypes(),
    getConnectors(),
  ]);

  // Transform data for the component (local data is already in the correct format)
  const transformedData = {
    cableSeries: cableSeries.map((series: any) => ({
      id: series._id || series.id,
      name: series.name,
      slug: series.slug?.current || series.slug,
    })),
    cableTypes: cableTypes.map((type: any) => ({
      id: type._id || type.id,
      name: type.name,
      slug: type.slug?.current || type.slug,
      series: type.series?.slug?.current || type.series?.slug || type.series || "",
      seriesName: type.series?.name || type.seriesName || "",
      pricePerFoot: type.pricePerFoot || 0,
      image: type.image || (type.image ? imageBuilder(type.image).url() : null),
    })),
    connectors: connectors.map((connector: any) => ({
      id: connector._id || connector.id,
      name: connector.name || connector.title,
      slug: connector.slug?.current || connector.slug || connector.handle,
      image: connector.image || (connector.image ? imageBuilder(connector.image).url() : null),
      // Pricing is already in the correct format from local data
      pricing: Array.isArray(connector.pricing) ? connector.pricing : [],
    })),
  };


  return (
    <main style={{ backgroundColor: '#ffffff' }}>
      <CableCustomizerClient data={transformedData} />
    </main>
  );
};

export default CableCustomizerPage;
