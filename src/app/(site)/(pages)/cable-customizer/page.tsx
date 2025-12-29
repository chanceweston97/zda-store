import { CableCustomizerClient } from "@/components/CableCustomizer";
import { Metadata } from "next";
import { getCableSeries, getCableTypes, getConnectors, imageBuilder } from "@/lib/data/shop-utils";

export const metadata: Metadata = {
  title: "Cable Customizer | ZDAComm | Store",
  description: "Build your perfect custom cable. Select connectors, length, and specifications.",
};

const CableCustomizerPage = async () => {
  // Cable customizer uses LOCAL DATA ONLY (not from WooCommerce or Medusa)
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
    <main>
      <CableCustomizerClient data={transformedData} />
    </main>
  );
};

export default CableCustomizerPage;

