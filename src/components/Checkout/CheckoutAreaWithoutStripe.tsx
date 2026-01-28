"use client";
import { useSession } from "next-auth/react";
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
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

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

    // Create order via WooCommerce
    const createOrder = async (paymentStatus: "pending" | "paid") => {
      try {
        // Convert cart items to format expected by WooCommerce checkout
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

        const checkoutEndpoint = "/api/woocommerce/checkout/complete";

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
              state: data.billing.stateOrProvince || "",
              postalCode: data.billing.zipCode || "00000",
              phone: data.billing.phone,
            },
            billing_address: data.shipToDifferentAddress ? {
              firstName: data.shipping?.address?.street ? data.billing.firstName : data.billing.firstName,
              lastName: data.shipping?.address?.street ? data.billing.lastName : data.billing.lastName,
              street: data.shipping?.address?.street || data.billing.address.street,
              apartment: data.shipping?.address?.apartment || data.billing.address.apartment,
              town: data.shipping?.town || data.billing.town,
              country: data.shipping?.countryName || data.billing.regionName || data.billing.country,
              country_code: data.shipping?.countryName || data.billing.regionName || data.billing.country,
              state: data.shipping?.stateOrProvince || data.billing.stateOrProvince || "",
              postalCode: data.shipping?.zipCode || data.billing.zipCode || "00000",
              phone: data.shipping?.phone || data.billing.phone,
            } : undefined,
            payment_method: "cod",
            same_as_billing: !data.shipToDifferentAddress,
            cartItems,
            payment_status: "pending",
            shipping_method: data.shippingMethod,
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
      <section className="overflow-hidden py-20 bg-gray-2" style={{ marginTop: '80px' }}>
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
              className="btn filled group relative w-full inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2958A4] mt-7.5"
              style={{ 
                fontFamily: 'Satoshi, sans-serif',
                padding: '10px 30px',
                paddingRight: '30px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.paddingRight = '30px';
                }
              }}
            >
              <ButtonArrowHomepage />
              <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{!loading ? `Pay $${amount.toFixed(2)}` : "Processing..."}</p>
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
