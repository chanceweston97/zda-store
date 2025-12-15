import { useEffect } from "react";
import { set, useFormValue } from "sanity";
import { NumberInputProps } from "sanity";

/**
 * Custom input component for length option price that automatically calculates
 * price = pricePerFoot × length when length is entered
 * The price field is read-only and cannot be manually edited
 */
export function LengthPriceInput(props: NumberInputProps) {
  const { value, onChange } = props;
  
  // Get the length value from the same object (sibling field)
  // In Sanity array items, sibling fields are accessed via the parent object
  // Try different path variations
  const parentObj = useFormValue(["_parent"]) as any;
  const length = parentObj?.length as string | undefined;
  
  // Get pricePerFoot from the parent document (cableType)
  // Path: lengthOptions[].price -> lengthOptions[] -> cableType document -> pricePerFoot
  // Try accessing via document path
  const documentPricePerFoot = useFormValue(["..", "..", "pricePerFoot"]) as number | undefined;
  const parentPricePerFoot = useFormValue(["_parent", "_parent", "pricePerFoot"]) as number | undefined;
  const pricePerFoot = documentPricePerFoot || parentPricePerFoot;

  // Calculate and update price when length or pricePerFoot changes
  useEffect(() => {
    if (length && pricePerFoot && pricePerFoot > 0) {
      // Parse length from string (e.g., "10 ft" -> 10, or just "10" -> 10)
      const lengthStr = String(length).trim();
      // Match numbers (integers or decimals) - handles "10", "10 ft", "10.5", "10.5 ft", etc.
      const lengthMatch = lengthStr.match(/(\d+\.?\d*)/);
      if (lengthMatch) {
        const lengthInFeet = parseFloat(lengthMatch[1]);
        if (lengthInFeet > 0) {
          const calculated = Math.round(pricePerFoot * lengthInFeet * 100) / 100;
          // Only update if different to avoid infinite loops
          if (calculated !== value) {
            onChange(set(calculated));
          }
        }
      }
    } else if (!length && value) {
      // Clear price if length is cleared
      onChange(set(0));
    }
  }, [length, pricePerFoot, value, onChange]);

  // Render the default input with readOnly prop
  return props.renderDefault({
    ...props,
    readOnly: true,
  });
}

