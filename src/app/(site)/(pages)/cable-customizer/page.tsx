import { CableCustomizerClient } from "@/components/CableCustomizer";
import { Metadata } from "next";
import { isMedusaEnabled } from "@/lib/medusa/config";
import { getMedusaCableSeries, getMedusaCableTypes, getMedusaConnectors } from "@/lib/medusa/cable-customizer";
import { getCableSeries, getCableTypes, getConnectors, imageBuilder } from "@/lib/data/shop-utils";

export const metadata: Metadata = {
  title: "Cable Customizer | ZDAComm | Store",
  description: "Build your perfect custom cable. Select connectors, length, and specifications.",
};

const CableCustomizerPage = async () => {
  const useMedusa = isMedusaEnabled();

  // Fetch cable customizer data from Medusa or local fallback
  let cableSeries: any[] = [];
  let cableTypes: any[] = [];
  let connectors: any[] = [];

  if (useMedusa) {
    try {
      [cableSeries, cableTypes, connectors] = await Promise.all([
        getMedusaCableSeries(),
        getMedusaCableTypes(),
        getMedusaConnectors(),
      ]);
    } catch (error) {
      // Fallback to local data
      [cableSeries, cableTypes, connectors] = await Promise.all([
        getCableSeries(),
        getCableTypes(),
        getConnectors(),
      ]);
    }
  } else {
    // Use local data
    [cableSeries, cableTypes, connectors] = await Promise.all([
      getCableSeries(),
      getCableTypes(),
      getConnectors(),
    ]);
  }

  // Transform data for the component
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
      // Price from Medusa is already in dollars, no conversion needed
      pricePerFoot: type.pricePerFoot || 0,
      image: type.image || (type.image ? imageBuilder(type.image).url() : null),
    })),
    connectors: connectors.map((connector: any) => ({
      id: connector._id || connector.id,
      name: connector.name || connector.title,
      slug: connector.slug?.current || connector.slug || connector.handle,
      image: connector.image || (connector.image ? imageBuilder(connector.image).url() : null),
      // Pricing from Medusa is already in dollars, no conversion needed
      // Ensure pricing is always an array (even if empty)
      pricing: (() => {
        // If pricing is already an array with data, use it directly
        if (Array.isArray(connector.pricing) && connector.pricing.length > 0) {
          return connector.pricing.map((p: any) => {
            // Extract cableTypeSlug from various possible formats
            const cableTypeSlug = (
              p.cableType?.slug?.current || 
              p.cableType?.slug || 
              p.cableTypeSlug || 
              p.cable_type_slug || 
              ""
            );
            
            // Only normalize if we have a value
            const normalizedSlug = cableTypeSlug ? String(cableTypeSlug).toLowerCase().trim() : "";
            
            return {
              cableTypeSlug: normalizedSlug,
              cableTypeName: p.cableType?.name || p.cableTypeName || p.cable_type_name || "",
              price: p.price || 0,
            };
          }).filter((p: any) => p.cableTypeSlug); // Filter out entries without cableTypeSlug
        }
        // Return empty array if no pricing
        return [];
      })(),
    })),
  };


  return (
    <main>
      <CableCustomizerClient data={transformedData} />
    </main>
  );
};

export default CableCustomizerPage;

