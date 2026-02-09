import { Product } from "@/types/product";

/**
 * Get the default price for a product
 * Priority: 
 *   - Connector products: Lowest price from connector pricing
 *   - Antenna products: Product price field, or first gain option's price
 * This is used on shop/category listing pages to show a single default price
 * On product detail pages, use dynamic pricing based on selected gain option or cable type
 * 
 * @returns The product's default price, or 0 if no price is available
 */
export function getProductPrice(product: Product): number {
  // For cable products, calculate price from pricePerFoot × first length option
  if (product.productType === "cable") {
    const cableType = product.cableType || (product as any).cableType?.cableType;
    if (cableType?.pricePerFoot) {
      // If we have lengthOptions, calculate from first length
      if (product.lengthOptions && product.lengthOptions.length > 0) {
        const firstLength = product.lengthOptions[0];
        // Get length value (can be string or object with length property)
        let lengthValue = '';
        if (typeof firstLength === 'string') {
          lengthValue = firstLength;
        } else if (firstLength && typeof firstLength === 'object' && firstLength !== null && 'length' in firstLength) {
          lengthValue = String(firstLength.length);
        }
        
        if (lengthValue) {
          const lengthMatch = lengthValue.match(/(\d+\.?\d*)/);
          const lengthInFeet = lengthMatch ? parseFloat(lengthMatch[1]) : 0;
          if (lengthInFeet > 0) {
            return Math.round(cableType.pricePerFoot * lengthInFeet * 100) / 100;
          }
        }
      }
      // Fallback to pricePerFoot if no lengthOptions
      return cableType.pricePerFoot;
    }
    return product.price ?? 0;
  }

  // For connector products, calculate price based on first length option
  if (product.productType === "connector") {
    // First, check if this is a standalone connector (has pricing array directly)
    // For standalone connectors from connector document, calculate minimum price from pricing array
    const pricingArray = (product.pricing as any[]) || (product.connector?.pricing as any[]) || [];
    
    if (pricingArray.length > 0) {
      // Get all valid prices from the pricing array
      const prices = pricingArray
        .map((p) => p?.price)
        .filter((price): price is number => typeof price === 'number' && price > 0);
      
      if (prices.length > 0) {
        // Return the minimum price (first/lowest price like PDP)
        return Math.min(...prices);
      }
    }
    
    // Check if product has a direct price field (fallback)
    if (product.price && typeof product.price === 'number' && product.price > 0) {
      return product.price;
    }
    
    // For connector products (products with productType="connector" that have cable type and length),
    // calculate based on cable type and length
    // Get connector price for this cable type
    let connectorPrice = 0;
    if (product.connector?.pricing && product.cableType?._id) {
      const pricing = product.connector.pricing.find(
        (p) => p?.cableType?._id === product.cableType?._id
      );
      connectorPrice = pricing?.price ?? 0;
    }
    
    // If we have pricePerFoot and lengthOptions, calculate the price
    if (product.cableType?.pricePerFoot && product.lengthOptions && product.lengthOptions.length > 0) {
      // Parse first length option (e.g., "10 ft" -> 10)
      const firstLength = product.lengthOptions[0];
      const lengthMatch = firstLength?.match(/(\d+\.?\d*)/);
      const lengthInFeet = lengthMatch ? parseFloat(lengthMatch[1]) : 0;
      
      if (lengthInFeet > 0 && product.cableType.pricePerFoot > 0) {
        const cablePrice = product.cableType.pricePerFoot * lengthInFeet;
        const connectorPriceTotal = connectorPrice * 2; // Connector price × 2
        return Math.round((cablePrice + connectorPriceTotal) * 100) / 100;
      }
    }
    
    // Fallback: if no length options but we have connector price, show connector price × 2
    if (connectorPrice > 0) {
      return connectorPrice * 2;
    }
    
    return 0;
  }

  // First, check if product has a direct price field (default price)
  if (product.price && typeof product.price === 'number' && product.price > 0) {
    return product.price;
  }

  // Fallback to first gain option's price (for antenna products)
  if (product.gainOptions && product.gainOptions.length > 0) {
    const firstGain = product.gainOptions[0];
    
    // New format: object with price
    if (firstGain && typeof firstGain === 'object' && firstGain !== null && 'price' in firstGain && typeof firstGain.price === 'number') {
      return firstGain.price;
    }
  }
  
  // No price available
  return 0;
}

function getVariantPrice(variant: any): number {
  if (variant?.calculated_price?.calculated_amount) {
    return variant.calculated_price.calculated_amount / 100;
  }
  if (variant?.price != null) {
    const p = typeof variant.price === 'number' ? variant.price : parseFloat(variant.price);
    return isNaN(p) ? 0 : p;
  }
  return 0;
}

function getLengthOptionPrice(opt: any, product: Product, pricePerFoot: number): number {
  if (!opt) return 0;
  // From variant via variantId (like PDP)
  if (typeof opt === 'object' && opt.variantId) {
    const variants = (product as any).variants;
    if (Array.isArray(variants)) {
      const v = variants.find((x: any) => x.id === opt.variantId);
      const p = getVariantPrice(v);
      if (p > 0) return p;
    }
  }
  // Direct price on option
  if (typeof opt === 'object' && opt !== null && typeof opt.price === 'number' && opt.price > 0) {
    return opt.price < 1 ? opt.price : opt.price / 100;
  }
  // pricePerFoot × length
  let val = '';
  if (typeof opt === 'string') val = opt;
  else if (opt?.value != null) val = String(opt.value);
  else if (opt?.length != null) val = String(opt.length);
  const m = val.match(/(\d+\.?\d*)/);
  const feet = m ? parseFloat(m[1]) : 0;
  return feet > 0 && pricePerFoot > 0 ? Math.round(pricePerFoot * feet * 100) / 100 : 0;
}

function getGainOptionPrice(opt: any): number {
  if (!opt || typeof opt !== 'object') return 0;
  if ('price' in opt && typeof opt.price === 'number') {
    return opt.price >= 1000 ? opt.price / 100 : opt.price;
  }
  return 0;
}

/**
 * Get price range for a product (min and max prices - like PDP default)
 * Returns { min: number, max: number } or null if no valid prices found
 */
export function getProductPriceRange(product: Product): { min: number; max: number } | null {
  // Use API-provided price range (from products listing when variations were fetched)
  const priceMin = (product as any).priceMin;
  const priceMax = (product as any).priceMax;
  if (typeof priceMin === "number" && typeof priceMax === "number" && priceMin > 0 && priceMax > 0) {
    return { min: priceMin, max: priceMax };
  }

  const prices: number[] = [];

  // WooCommerce variants (cable, antenna, connector)
  const variants = (product as any).variants;
  if (Array.isArray(variants) && variants.length > 0) {
    for (const v of variants) {
      const p = getVariantPrice(v);
      if (p > 0) prices.push(p);
    }
  }

  // Cable with lengthOptions (first length to last length - like PDP)
  if (product.productType === "cable" && product.lengthOptions?.length > 0) {
    const cableType = product.cableType || (product as any).cableType?.cableType;
    const pricePerFoot = cableType?.pricePerFoot ?? 0;
    for (const opt of product.lengthOptions) {
      const p = getLengthOptionPrice(opt, product, pricePerFoot);
      if (p > 0) prices.push(p);
    }
  }

  // Connector products, use connector pricing
  if (product.productType === "connector" && product.connector?.pricing) {
    for (const pricing of product.connector.pricing) {
      if (pricing?.price != null && typeof pricing.price === 'number' && pricing.price > 0) {
        prices.push(pricing.price);
      }
    }
  }

  // Antenna products: first gain to last gain (like PDP)
  if (product.gainOptions && product.gainOptions.length > 0) {
    for (const gainOption of product.gainOptions) {
      const p = getGainOptionPrice(gainOption);
      if (p > 0) prices.push(p);
    }
  }

  // Simple products: single price fallback when no gain/length/variant options
  if (prices.length === 0 && product.price != null && typeof product.price === 'number' && product.price > 0) {
    prices.push(product.price);
  }
  if (prices.length === 0 && (product as any).discountedPrice != null && typeof (product as any).discountedPrice === 'number' && (product as any).discountedPrice > 0) {
    prices.push((product as any).discountedPrice);
  }

  if (prices.length === 0) {
    return null;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return { min, max };
}

/**
 * Get formatted price display string for a product (like PDP default)
 * Shows single price, or price range (min - max) when multiple variants
 */
export function getProductPriceDisplay(product: Product): string {
  const priceRange = getProductPriceRange(product);

  if (!priceRange) {
    const price = getProductPrice(product);
    if (price === 0) return 'Price on request';
    return `$${price.toFixed(2)}`;
  }

  if (priceRange.min !== priceRange.max) {
    return `$${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`;
  }

  return `$${priceRange.min.toFixed(2)}`;
}

