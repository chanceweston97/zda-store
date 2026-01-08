"use client";
import { useSession } from "next-auth/react";
import Breadcrumb from "../Common/Breadcrumb";
import Billing from "./Billing";
import Coupon from "./Coupon";
import Login from "./Login";
import Notes from "./Notes";
import PaymentMethod from "./PaymentMethod";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import { CheckoutInput, useCheckoutForm } from "./form";
import Orders from "./Orders";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useShoppingCart } from "use-shopping-cart";
import { ButtonArrow } from "@/components/Common/ButtonArrow";

const CheckoutAreaWithoutStripe = ({ amount }: { amount: number }) => {
  const { handleSubmit } = useCheckoutForm();

  const { data: session } = useSession();

  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { cartDetails } = useShoppingCart();

  // Handle checkout
  const handleCheckout = async (data: CheckoutInput) => {
    setLoading(true);
    setErrorMessage("");

    if (data.billing.createAccount) {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.billing.email,
            name: data.billing.firstName,
            password: "12345678",
          }),
        });
        
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        let result;
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response from register API:", text.substring(0, 200));
          // If registration fails, allow checkout to continue (registration is optional)
          console.warn("Account creation failed, but continuing with checkout");
          // Don't return - allow checkout to proceed
        }
        
        // Only block checkout if registration explicitly failed with a critical error
        if (result && !result.success && response.status !== 503) {
          toast.error(
            `${result?.message} for creating account` || "Failed to register user"
          );
          setLoading(false);
          return;
        } else if (result && !result.success && response.status === 503) {
          // Registration unavailable (e.g., DATABASE_URL missing) - allow checkout to proceed
          console.warn("Account creation is currently unavailable, but you can still checkout");
        } else if (result && result.success) {
          toast.success("Account created successfully");
        }
      } catch (error: any) {
        console.error("Error creating account:", error);
        // Don't block checkout if account creation fails - it's optional
        console.warn("Account creation failed, but you can still checkout");
        // Continue with checkout
      }
    }

    // Create order via Medusa
    const createOrder = async (paymentStatus: "pending" | "paid") => {
      try {
        // Convert cart items to format expected by Medusa checkout
        const cartItems = Object.values(cartDetails ?? {}).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          slug: item.slug,
          variantId: (item as any).variantId,
          sku: (item as any).sku,
          metadata: item.metadata,
        }));

        // NOTE: Custom checkout (Option 3) disabled due to API key authentication issues
        // Using regular checkout flow which stores metadata correctly
        // Custom cable details will be in line item metadata for admin viewing
        const checkoutEndpoint = "/api/checkout/complete";

        const response = await fetch(checkoutEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session?.user?.email || data.billing?.email,
            shipping_address: {
              firstName: data.billing.firstName,
              lastName: data.billing.lastName,
              street: data.billing.address.street,
              apartment: data.billing.address.apartment,
              town: data.billing.town,
              country: data.billing.regionName || data.billing.country,
              country_code: data.billing.regionName || data.billing.country,
              regionName: data.billing.regionName,
              postalCode: data.billing.postalCode || "00000",
              phone: data.billing.phone,
            },
            billing_address: data.shipToDifferentAddress ? {
              firstName: data.shipping.address?.street ? data.billing.firstName : data.billing.firstName,
              lastName: data.shipping.address?.street ? data.billing.lastName : data.billing.lastName,
              street: data.shipping.address?.street || data.billing.address.street,
              apartment: data.shipping.address?.apartment || data.billing.address.apartment,
              town: data.shipping.town || data.billing.town,
              country: data.shipping.country || data.billing.regionName || data.billing.country,
              country_code: data.shipping.country || data.billing.regionName || data.billing.country,
              regionName: data.shipping.country || data.billing.regionName,
              postalCode: data.shipping.postalCode || data.billing.postalCode || "00000",
              phone: data.shipping.phone || data.billing.phone,
            } : undefined,
            payment_method: "cod",
            same_as_billing: !data.shipToDifferentAddress,
            cartItems,
            payment_status: "pending",
          }),
        });

        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const text = await response.text();
          console.error("Non-JSON response from server:", text.substring(0, 200));
          throw new Error("Server returned an invalid response. Please try again.");
        }

        if (!result.success) {
          throw new Error(result.message || "Failed to create order");
        }

        toast.success("Order placed successfully!");
        
        // Clear the frontend cart after successful order creation
        // This prevents cart reuse issues on next checkout
        if (typeof window !== 'undefined') {
          // Clear use-shopping-cart localStorage
          try {
            localStorage.removeItem('use-shopping-cart');
            localStorage.removeItem('_medusa_cart_id');
            console.log('[Checkout] Cleared cart from localStorage after successful order');
          } catch (e) {
            console.warn('[Checkout] Could not clear localStorage:', e);
          }
        }
        
        router.push(`/success?orderId=${result.order?.id || ""}`);
        return true;
      } catch (error: any) {
        console.error("Error creating order:", error);
        let errorMessage = "Failed to create order. Please try again.";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error instanceof SyntaxError) {
          errorMessage = "Server error: Invalid response. Please check server logs and try again.";
        }
        
        toast.error(errorMessage);
        return false;
      }
    };

    if (data.paymentMethod === "cod") {
      const success = await createOrder("pending");
      setLoading(false); // Stop loading regardless of success or failure
      if (!success) return; // Exit if order creation failed
      return;
    }
  };

  return (
    <>
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0 lg:columns-2 gap-7.5 xl:gap-8">
          {!Boolean(session?.user) && <Login />}

          <form className="contents" onSubmit={handleSubmit(handleCheckout)}>
            <Billing />

            <Shipping />

            <Notes />

            <Orders />

            <Coupon />

            <ShippingMethod />

            <PaymentMethod amount={amount} />

            <button
              type="submit"
              disabled={loading}
              className="group w-full inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2958A4] mt-7.5"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              <ButtonArrow />
              <span>{!loading ? `Pay $${amount.toFixed(2)}` : "Processing..."}</span>
            </button>
            {errorMessage && (
              <p className="mt-2 text-center text-red">{errorMessage}</p>
            )}
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutAreaWithoutStripe;
