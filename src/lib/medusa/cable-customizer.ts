/**
 * Medusa Cable Customizer Integration
 * Functions to fetch cable series, cable types, and connectors from Medusa backend
 */

import { medusaClient } from "./client";
import { isMedusaEnabled } from "./config";

/**
 * Get all cable series from Medusa
 * Cable series are hardcoded (like frontend project) - RG Series and LMR Series
 */
export async function getMedusaCableSeries(): Promise<any[]> {
  if (!isMedusaEnabled()) {
    return [];
  }

  // Hardcode cable series (like frontend project)
  // Series are determined from cable type names, not stored as separate products
  const cableSeries = [
    {
      id: "rg-series",
      _id: "rg-series",
      name: "RG Series",
      slug: "rg-series",
      image: null,
    },
    {
      id: "lmr-series",
      _id: "lmr-series",
      name: "LMR Series",
      slug: "lmr-series",
      image: null,
    },
  ];

  return cableSeries;
}

/**
 * Get all cable types from Medusa
 * Cable types are products with productType="cable" in metadata
 */
export async function getMedusaCableTypes(): Promise<any[]> {
  if (!isMedusaEnabled()) {
    return [];
  }

  try {
    const response = await medusaClient.getProducts({
      limit: 100,
      fields: "*metadata,*categories,title,handle,images",
    });

    // Filter products that are cable types (check metadata)
    const cableTypes = response.products
      .filter((product: any) => product.metadata?.productType === "cable")
      .map((product: any) => {
        // Determine series based on product title/name (like frontend project)
        // Check if product title contains "LMR" or "RG"
        const productTitle = product.title || "";
        const titleLower = productTitle.toLowerCase();
        
        let seriesSlug = "rg-series"; // Default to RG
        let seriesName = "RG Series";
        
        if (titleLower.includes("lmr")) {
          seriesSlug = "lmr-series";
          seriesName = "LMR Series";
        } else if (titleLower.includes("rg")) {
          seriesSlug = "rg-series";
          seriesName = "RG Series";
        }
        
        // Also check metadata/category for series info (override if available)
        const cableSeries = product.categories?.find((cat: any) => 
          cat.handle?.includes("series") || cat.name?.toLowerCase().includes("series")
        ) || product.metadata?.cableSeries;
        
        const finalSeriesSlug = cableSeries?.handle || cableSeries?.slug || product.metadata?.cableSeriesSlug || seriesSlug;
        const finalSeriesName = cableSeries?.name || product.metadata?.cableSeriesName || seriesName;

        return {
          id: product.id,
          _id: product.id,
          name: product.title,
          slug: product.handle,
          series: finalSeriesSlug,
          seriesName: finalSeriesName,
          // pricePerFoot from metadata is in DOLLARS (not cents)
          // Also check for price_per_foot (snake_case) as fallback
          pricePerFoot: (() => {
            const pricePerFoot = product.metadata?.pricePerFoot || product.metadata?.price_per_foot;
            if (!pricePerFoot) return 0;
            // Metadata prices are in dollars, not cents
            return typeof pricePerFoot === 'number' 
              ? pricePerFoot 
              : (parseFloat(String(pricePerFoot)) || 0);
          })(),
          image: product.images?.[0]?.url || product.thumbnail || null,
          maxLength: product.metadata?.maxLength 
            ? (typeof product.metadata.maxLength === 'number' 
                ? product.metadata.maxLength 
                : parseFloat(product.metadata.maxLength) || null)
            : null,
          allowedConnectors: product.metadata?.allowedConnectors 
            ? (Array.isArray(product.metadata.allowedConnectors) 
                ? product.metadata.allowedConnectors 
                : [])
            : null,
        };
      });

    return cableTypes;
  } catch (error) {
    return [];
  }
}

/**
 * Get all connectors from Medusa
 * Connectors are products with productType="connector" in metadata
 */
export async function getMedusaConnectors(): Promise<any[]> {
  if (!isMedusaEnabled()) {
    return [];
  }

  try {
    // First, get cable types for matching variants
    const cableTypesResponse = await medusaClient.getProducts({
      limit: 100,
      fields: "*metadata,title,handle",
    });
    
    // Get cable types for matching
    const cableTypes = cableTypesResponse.products
      .filter((product: any) => product.metadata?.productType === "cable")
      .map((product: any) => ({
        id: product.id,
        name: product.title,
        slug: product.handle,
      }));
    
    // Then fetch connectors with variants
    const response = await medusaClient.getProducts({
      limit: 100,
      fields: "*metadata,*variants.calculated_price,*variants.metadata,*variants.title,*variants.sku,title,handle,images",
    });

    // Filter products that are connectors (check metadata)
    const connectors = response.products
      .filter((product: any) => product.metadata?.productType === "connector")
      .map((product: any) => {
        // Extract pricing from metadata
        // IMPORTANT: Metadata connectorPricing is stored in DOLLARS (not cents)
        // Pricing structure: { cableTypeSlug: price, ... } or array of { cableTypeSlug, price }
        let pricing: Array<{ cableTypeSlug: string; cableTypeName: string; price: number }> = [];
        
        // Check multiple possible field names for connector pricing
        let connectorPricing = product.metadata?.connectorPricing 
          || product.metadata?.connector_pricing
          || product.metadata?.pricing
          || product.metadata?.connectorPricingData;
        
        // Try to parse if it's a JSON string
        if (typeof connectorPricing === 'string') {
          try {
            connectorPricing = JSON.parse(connectorPricing);
          } catch (e) {
            // Not JSON, keep as is
          }
        }
        
        if (connectorPricing) {
          if (Array.isArray(connectorPricing)) {
            // Array format: [{ cableTypeSlug, cableTypeName, price }, ...]
            pricing = connectorPricing.map((p: any) => {
              // Try multiple field names for cableTypeSlug
              const cableTypeSlug = p.cableTypeSlug || p.cable_type_slug || p.cableType || p.cable_type || "";
              const cableTypeName = p.cableTypeName || p.cable_type_name || "";
              // Connector prices from Medusa metadata are stored in DOLLARS, use as-is
              const price = typeof p.price === 'number' ? p.price : (parseFloat(String(p.price)) || 0);
              
              return {
                cableTypeSlug: cableTypeSlug.toLowerCase().trim(), // Normalize slug
                cableTypeName,
                price,
              };
            });
          } else if (typeof connectorPricing === 'object') {
            // Object format: { cableTypeSlug: price, ... }
            pricing = Object.entries(connectorPricing).map(([cableTypeSlug, price]: [string, any]) => {
              // Connector prices from Medusa metadata are stored in DOLLARS, use as-is
              const priceValue = typeof price === 'number' ? price : (parseFloat(String(price)) || 0);
              
              return {
                cableTypeSlug: cableTypeSlug.toLowerCase().trim(), // Normalize slug
                cableTypeName: cableTypeSlug, // Use slug as name if name not provided
                price: priceValue,
              };
            });
          }
        }
        
        // Fallback: Get pricing from variants if metadata didn't provide pricing
        if (pricing.length === 0 && product.variants && product.variants.length > 0) {
          product.variants.forEach((variant: any) => {
            // Get variant price
            const calculatedPrice = variant?.calculated_price as any;
            let priceInDollars = 0;
            
            if (calculatedPrice?.calculated_amount) {
              // calculated_amount is already in dollars (same as metadata prices)
              const amount = calculatedPrice.calculated_amount;
              priceInDollars = amount;
            } else if ((variant?.prices as any)?.[0]?.amount) {
              // prices[].amount is in dollars (same as metadata prices)
              priceInDollars = (variant.prices as any)[0].amount;
            }
            
            // Try to find cable type from variant metadata
            const variantMetadata = (variant.metadata || {}) as Record<string, any>;
            const variantCableType = variantMetadata.cableType || 
                                    variantMetadata.cable_type || 
                                    variantMetadata.cableTypeSlug ||
                                    variantMetadata.cable_type_slug ||
                                    null;
            
            // Also check variant title/SKU for cable type name
            const variantTitle = (variant.title || variant.sku || "") as string;
            
            if (variantCableType && typeof variantCableType === 'string') {
              // Find matching cable type by slug
              const matchingCableType = cableTypes.find((ct: any) => 
                ct.slug === variantCableType || 
                ct.slug.toLowerCase() === variantCableType.toLowerCase()
              );
              
              if (matchingCableType && priceInDollars > 0) {
                pricing.push({
                  cableTypeSlug: matchingCableType.slug.toLowerCase().trim(),
                  cableTypeName: matchingCableType.name,
                  price: priceInDollars,
                });
              }
            } else if (variantTitle) {
              // Try to match cable type by name in variant title/SKU
              const matchingCableType = cableTypes.find((ct: any) => 
                variantTitle.toLowerCase().includes(ct.name.toLowerCase()) ||
                variantTitle.toLowerCase().includes(ct.slug.toLowerCase())
              );
              
              if (matchingCableType && priceInDollars > 0) {
                pricing.push({
                  cableTypeSlug: matchingCableType.slug.toLowerCase().trim(),
                  cableTypeName: matchingCableType.name,
                  price: priceInDollars,
                });
              }
            }
          });
        }
        
        // If still no pricing found, use first variant price for all cable types (fallback)
        if (pricing.length === 0 && product.variants && product.variants.length > 0) {
          const firstVariant = product.variants[0] as any;
          const calculatedPrice = firstVariant?.calculated_price as any;
          let connectorPrice = 0;
          
          if (calculatedPrice?.calculated_amount) {
            // calculated_amount is already in dollars (same as metadata prices)
            connectorPrice = calculatedPrice.calculated_amount;
          } else if ((firstVariant?.prices as any)?.[0]?.amount) {
            // prices[].amount is in dollars (same as metadata prices)
            connectorPrice = (firstVariant.prices as any)[0].amount;
          }
          
          if (connectorPrice > 0 && cableTypes.length > 0) {
            // Assign same price to all cable types
            pricing = cableTypes.map((cableType: any) => ({
              cableTypeSlug: cableType.slug.toLowerCase().trim(),
              cableTypeName: cableType.name,
              price: connectorPrice,
            }));
          }
        }

        return {
          id: product.id,
          _id: product.id,
          name: product.title,
          slug: product.handle,
          image: product.images?.[0]?.url || product.thumbnail || null,
          pricing: pricing || [], // Ensure pricing is always an array
        };
      });

    return connectors;
  } catch (error) {
    return [];
  }
}

