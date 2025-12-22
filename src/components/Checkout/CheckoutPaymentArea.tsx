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
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useShoppingCart } from "use-shopping-cart";

const CheckoutPaymentArea = ({ amount }: { amount: number }) => {
  const { handleSubmit } = useCheckoutForm();

  const { data: session } = useSession();

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const { cartDetails } = useShoppingCart();

  // Create a PaymentIntent as soon as the page loads
  useEffect(() => {
    if (amount <= 0) {
      console.error("Invalid amount for payment intent:", amount);
      setErrorMessage(`Invalid amount: $${amount.toFixed(2)}. Please check your cart.`);
      return;
    }

    // Reset error message when retrying
    setErrorMessage("");

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then(async (res) => {
        // Check content type to handle HTML error pages (404, 500, etc.)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Payment intent API returned non-JSON response:", {
            status: res.status,
            statusText: res.statusText,
            contentType,
            bodyPreview: text.substring(0, 200),
          });
          throw new Error(`Server error (${res.status}): API endpoint returned ${contentType || 'unknown content type'} instead of JSON. Please check server logs.`);
        }

        if (!res.ok) {
          const err = await res.json();
          const errorMsg = err.error || "Failed to create payment intent";
          console.error("Payment intent API error:", errorMsg, err);
          throw new Error(errorMsg);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          console.error("Payment intent error:", data.error);
          setErrorMessage(data.error);
        } else if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setErrorMessage(""); // Clear any previous errors
        } else {
          throw new Error("Payment intent created but no client secret returned");
        }
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        const errorMessage = error.message || "Failed to initialize payment. Please refresh the page.";
        setErrorMessage(errorMessage);
      });
  }, [amount]);

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

    // Helper function to create order via Medusa
    const createOrder = async (paymentStatus: "pending" | "paid", paymentIntentId?: string) => {
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
            payment_method: paymentStatus === "paid" ? "stripe" : "cod",
            same_as_billing: !data.shipToDifferentAddress,
            cartItems,
            payment_status: paymentStatus,
            ...(paymentIntentId && { payment_intent_id: paymentIntentId }),
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
        console.error("Order creation error:", error);
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

    if (!stripe || !elements) {
      setErrorMessage("Payment system not ready. Please refresh the page.");
      setLoading(false);
      return;
    }

    if (!clientSecret) {
      setErrorMessage("Payment not initialized. Please refresh the page.");
      setLoading(false);
      return;
    }

    // Continue with Stripe Payment if NOT COD
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const siteUrl = process.env.SITE_URL || "http://www.localhost:8000";
    try {
      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${siteUrl}/success?amount=${amount}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.log(error, "error in payment");
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Pass payment intent ID for Stripe payments
        const orderSuccess = await createOrder("paid", paymentIntent.id);
        if (!orderSuccess) {
          toast.error(
            "Payment was successful, but order creation failed. Please contact support."
          );
          console.error(
            "Payment succeeded but order failed. PaymentIntent:",
            paymentIntent
          );
        }
      }
    } catch (err) {
      console.log(err, "err in payment");
      setErrorMessage("Order processing failed. Please try again.");
    }

    setLoading(false);
  };

  // Check if Stripe is loaded
  if (!stripe || !elements) {
    return (
      <div className="mt-48 text-center">
        <div className="flex items-center justify-center h-80">
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#2958A4] border-t-transparent rounded-full animate-spin mb-3.5 text-center"></div>
            <p className="mt-4 text-lg font-semibold text-[#2958A4]">
              Loading payment system...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if payment intent creation failed
  if (!clientSecret && errorMessage) {
    return (
      <div className="mt-48 text-center">
        <div className="flex items-center justify-center h-80">
          <div className="relative flex flex-col items-center">
            <p className="mt-4 text-lg font-semibold text-red mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-600">
              Please refresh the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Still loading payment intent
  if (!clientSecret) {
    return (
      <div className="mt-48 text-center">
        <div className="flex items-center justify-center h-80">
          <div className="relative flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#2958A4] border-t-transparent rounded-full animate-spin mb-3.5 text-center"></div>
            <p className="mt-4 text-lg font-semibold text-[#2958A4]">
              Initializing payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 xl:px-0 lg:columns-2 gap-7.5 xl:gap-8">
          {!Boolean(session?.user) && (
            <div className="mb-6">
              <Login />
            </div>
          )}
          <form onSubmit={handleSubmit(handleCheckout)}>
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
                  className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white mt-7.5"
                >
                  {!loading ? `Pay $${amount.toFixed(2)}` : "Processing..."}
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

export default CheckoutPaymentArea;
