export const formatPrice = (amount: number | null | undefined): string => {
  if (amount == null) return "0.00";
  return Number(amount).toFixed(2);  // ❗ no dividing by 100
};

/**
 * Convert price from use-shopping-cart format to dollars for display
 * use-shopping-cart should store prices in cents, but we handle edge cases
 * where prices might be stored in dollars
 */
export const convertCartPriceToDollars = (price: number): number => {
  // use-shopping-cart should always store prices in cents
  // So $150.00 should be stored as 15000 cents
  // But if somehow it's stored as 150 (dollars), we need to detect that
  
  // Simple heuristic: if price < 1000, it's likely already in dollars
  // (since most products cost less than $1000, and cents would be >= 1000)
  // If price >= 1000, it's likely in cents (e.g., $10.00 = 1000 cents)
  if (price < 1000) {
    // Likely already in dollars (e.g., $150 stored as 150)
    return price;
  }
  
  // Price >= 1000, assume it's in cents and convert to dollars
  return price / 100;
};
