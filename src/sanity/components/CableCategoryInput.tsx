import { useEffect, useState } from "react";
import { set, useClient } from "sanity";
import { ReferenceInputProps } from "sanity";

/**
 * Custom input component for cable type category that defaults to "Cables" category
 */
export function CableCategoryInput(props: ReferenceInputProps) {
  const { value, onChange } = props;
  const client = useClient({ apiVersion: "2023-03-09" });
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-select "Cables" category if no category is selected (only once on mount)
  useEffect(() => {
    if (!isInitialized && !value) {
      setIsInitialized(true);
      // Find the "Cables" category by slug (case-insensitive) or title
      // Try common variations: "cables", "Cables", "CABLE", etc.
      client
        .fetch(`*[_type == "category" && (lower(slug.current) == "cables" || lower(title) == "cables")][0]._id`)
        .then((cableCategoryId: string | null) => {
          if (cableCategoryId) {
            onChange(set({ _type: "reference", _ref: cableCategoryId }));
          }
        })
        .catch((error) => {
          console.error("Error fetching Cables category:", error);
        });
    }
  }, [value, onChange, client, isInitialized]);

  // Use the default reference input
  return props.renderDefault(props);
}

