"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/input/radio";
import { useCheckoutForm } from "./form";
import { useShoppingCart } from "use-shopping-cart";

interface ShippingMethodOption {
  id: string;
  name: string;
  price: number;
  provider?: string;
  estimatedDays?: number;
  serviceLevel?: string;
}

export default function ShippingMethod() {
  const { errors, control, watch, setValue } = useCheckoutForm();
  const { cartDetails } = useShoppingCart();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch shipping address to fetch rates when address is available
  const shippingAddress = watch("shipping");
  const billingAddress = watch("billing");
  const shipToDifferentAddress = watch("shipToDifferentAddress");

  // Get the address to use (shipping if different, otherwise billing)
  const addressTo = shipToDifferentAddress && shippingAddress ? shippingAddress : billingAddress;

  useEffect(() => {
    // Only fetch if we have a valid address
    if (!addressTo?.town || !addressTo?.address?.street) {
      return;
    }

    const fetchShippingRates = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate parcel dimensions from cart items
        // Default to standard package if no weight/dimensions available
        const parcels = [
          {
            length: "10",
            width: "10",
            height: "5",
            distance_unit: "in" as const,
            weight: "1",
            mass_unit: "lb" as const,
          },
        ];

        // If cart items have weight/dimensions, use those
        if (cartDetails) {
          const items = Object.values(cartDetails);
          if (items.length > 0) {
            // You can enhance this to calculate actual weight/dimensions from cart items
            // For now, using defaults
          }
        }

        // Import warehouse address dynamically to avoid SSR issues
        const { getWarehouseAddress } = await import("@/lib/config/shipping");
        const warehouseAddress = getWarehouseAddress();

        // Validate warehouse address
        if (!warehouseAddress.street || !warehouseAddress.city) {
          throw new Error("Warehouse address not configured. Please set NEXT_PUBLIC_WAREHOUSE_* environment variables.");
        }

        const response = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address_from: {
              name: warehouseAddress.name,
              street: warehouseAddress.street,
              city: warehouseAddress.city,
              state: warehouseAddress.state,
              zip: warehouseAddress.zip,
              country: warehouseAddress.country,
              phone: warehouseAddress.phone,
              email: warehouseAddress.email,
            },
            address_to: {
              firstName: billingAddress?.firstName || "",
              lastName: billingAddress?.lastName || "",
              street: addressTo.address?.street || "",
              apartment: addressTo.address?.apartment || "",
              town: addressTo.town || "",
              state: addressTo.regionName || "",
              postalCode: addressTo.postalCode || "",
              country: addressTo.country || "US",
              country_code: addressTo.country || "US",
              phone: addressTo.phone || "",
              email: addressTo.email || "",
            },
            parcels,
            use_shippo: true, // Use Shippo if available
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to fetch shipping rates" }));
          throw new Error(errorData.error || "Failed to fetch shipping rates");
        }

        const data = await response.json();

        if (data.success && data.methods && data.methods.length > 0) {
          setShippingMethods(data.methods);
          
          // Auto-select first method if none selected
          const currentMethod = watch("shippingMethod");
          if (!currentMethod || !currentMethod.name) {
            const firstMethod = data.methods[0];
            setValue("shippingMethod", {
              name: firstMethod.id || firstMethod.name,
              price: firstMethod.price,
            });
          }
        } else {
          setError(data.message || "No shipping methods available");
          setShippingMethods([]);
        }
      } catch (err: any) {
        console.error("[ShippingMethod] Error fetching rates:", err);
        setError(err.message || "Failed to load shipping methods");
        setShippingMethods([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchShippingRates, 500);
    return () => clearTimeout(timeoutId);
  }, [addressTo, cartDetails, watch, setValue]);

  // Get provider logo/image
  const getProviderImage = (provider?: string): string | null => {
    if (!provider) return null;
    const providerLower = provider.toLowerCase();
    if (providerLower.includes("fedex") || providerLower === "fedex") {
      return "/images/checkout/fedex.svg";
    }
    if (providerLower.includes("dhl") || providerLower === "dhl") {
      return "/images/checkout/dhl.svg";
    }
    if (providerLower.includes("ups")) {
      return "/images/checkout/ups.svg"; // Add if you have UPS logo
    }
    if (providerLower.includes("usps")) {
      return "/images/checkout/usps.svg"; // Add if you have USPS logo
    }
    return null;
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-6">
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-6">Loading shipping options...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-4">
            <p className="text-sm text-red">{error}</p>
            <p className="text-xs text-gray-6 mt-2">
              Please ensure your shipping address is complete and try again.
            </p>
          </div>
        )}

        {!loading && !error && shippingMethods.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-6">
              No shipping methods available. Please complete your shipping address.
            </p>
          </div>
        )}

        {!loading && shippingMethods.length > 0 && (
          <div className="flex flex-col gap-4">
            {shippingMethods.map((method) => {
              const providerImage = getProviderImage(method.provider);
              
              return (
                <Controller
                  key={method.id}
                  name="shippingMethod"
                  control={control}
                  render={({ field }) => (
                    <RadioInput
                      name={field.name}
                      value={method.id}
                      label={
                        <ShippingMethodCard
                          method={method}
                          providerImage={providerImage}
                        />
                      }
                      onChange={(e) =>
                        field.onChange({
                          name: method.id,
                          price: method.price,
                        })
                      }
                    />
                  )}
                />
              );
            })}
          </div>
        )}

        {errors.shippingMethod && (
          <p className="mt-2 text-sm text-red">
            Please select a shipping method
          </p>
        )}
      </div>
    </div>
  );
}

function ShippingMethodCard({
  method,
  providerImage,
}: {
  method: ShippingMethodOption;
  providerImage: string | null;
}) {
  return (
    <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
      <div className="flex items-center">
        {providerImage && (
          <div className="pr-4">
            <Image
              src={providerImage}
              alt={`Logo of ${method.provider || method.name}`}
              width={64}
              height={18}
            />
          </div>
        )}

        <div className={providerImage ? "pl-4 border-l border-gray-4" : ""}>
          <p className="font-semibold text-dark">${method.price.toFixed(2)}</p>
          <p className="text-custom-xs text-gray-6">
            {method.name}
            {method.estimatedDays && ` • ${method.estimatedDays} ${method.estimatedDays === 1 ? "day" : "days"}`}
          </p>
        </div>
      </div>
    </div>
  );
}
