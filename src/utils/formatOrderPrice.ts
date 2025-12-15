/**
 * Formats order price for display
 * 
 * All orders are stored in DOLLARS in the database (as integers).
 * This function simply formats the dollar amount for display.
 * 
 * @param totalPrice - The total price from the order (in dollars)
 * @returns Formatted price string (e.g., "$50.00")
 */
export function formatOrderPrice(
  totalPrice: number | null | undefined
): string {
  if (totalPrice === null || totalPrice === undefined || totalPrice === 0) {
    return "$0.00";
  }

  // Prices are stored in dollars, just format for display
  return `$${totalPrice.toFixed(2)}`;
}

