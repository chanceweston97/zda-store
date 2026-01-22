"use client";
import { useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useForm } from "react-hook-form";
import { CheckoutFormProvider, CheckoutInput } from "./form";
import { useShoppingCart } from "use-shopping-cart";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { EmptyCartIcon } from "@/assets/icons";
import { ButtonArrow } from "@/components/Common/ButtonArrow";
import CheckoutPaymentArea from "./CheckoutPaymentArea";
import CheckoutAreaWithoutStripe from "./CheckoutAreaWithoutStripe";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { convertCartPriceToDollars } from "@/utils/price";
import { trackBeginCheckout } from "@/lib/ga4";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutMain() {
  const session = useSession();
  
  // Split full name into first and last name
  const getFirstName = (fullName: string | null | undefined): string => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts[0] || "";
  };

  const getLastName = (fullName: string | null | undefined): string => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts.slice(1).join(" ") || "";
  };

  const { register, formState, watch, control, handleSubmit, setValue } =
    useForm<CheckoutInput>({
      defaultValues: {
        shippingMethod: {
          name: "",
          price: 0,
        },
        paymentMethod: "bank",
        couponDiscount: 0,
        couponCode: "",
        billing: {
          address: {
            street: "",
            apartment: "",
          },
          companyName: "",
          country: "",
          email: session.data?.user?.email || "",
          firstName: getFirstName(session.data?.user?.name),
          lastName: getLastName(session.data?.user?.name),
          phone: "",
          regionName: "",
          town: "",
          createAccount: false,
        },
        shipping: {
          address: {
            street: "",
            apartment: "",
          },
          country: "",
          email: "",
          phone: "",
          town: "",
          countryName: "",
        },
        notes: "",
        shipToDifferentAddress: false,
      },
    });

  // Sync session data to form when it becomes available
  useEffect(() => {
    if (session.data?.user?.email) {
      setValue("billing.email", session.data.user.email);
    }
    if (session.data?.user?.name) {
      const firstName = getFirstName(session.data.user.name);
      const lastName = getLastName(session.data.user.name);
      if (firstName) {
        setValue("billing.firstName", firstName);
      }
      if (lastName) {
        setValue("billing.lastName", lastName);
      }
    }
  }, [session.data?.user?.email, session.data?.user?.name, setValue]);

  const { totalPrice = 0, cartDetails } = useShoppingCart();
  const cartIsEmpty = !cartDetails || Object.keys(cartDetails).length === 0;

  // GA4: Track begin checkout
  useEffect(() => {
    if (cartIsEmpty) return;
    
    const cartItems = Object.values(cartDetails!).map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price / 100, // Convert from cents to dollars
      category: item.category,
      quantity: item.quantity,
    }));
    
    trackBeginCheckout(cartItems);
  }, []); // Only track once on mount

  const shippingFee = watch("shippingMethod");
  // totalPrice from use-shopping-cart - convert to dollars using helper
  const totalPriceInDollars = convertCartPriceToDollars(totalPrice);
  const couponDiscount = ((watch("couponDiscount") || 0) * totalPriceInDollars) / 100;
  // amount should be in dollars (convertToSubcurrency will convert to cents for Stripe)
  const amount = Math.max(0, totalPriceInDollars - couponDiscount + (shippingFee?.price || 0));
  
  // Validate amount
  if (amount <= 0 && !cartIsEmpty) {
    console.error("Invalid checkout amount:", {
      totalPrice,
      couponDiscount,
      shippingFee: shippingFee?.price,
      amount,
      cartDetails
    });
  }

  if (cartIsEmpty) {
    return (
      <div className="py-20 mt-40">
        <div className="flex items-center justify-center mb-5">
          <EmptyCartIcon className="mx-auto text-blue" />
        </div>
        <h2 className="pb-5 text-2xl font-medium text-center text-dark">
          No items found in your cart to checkout.
        </h2>
        <div className="flex justify-center">
          <Link
            href="/products"
            className="group inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            <ButtonArrow />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  // Check if amount is valid (removed $0.50 minimum - allow any amount > 0)
  if (amount <= 0) {
    return (
      <div className="py-20 mt-40">
        <div className="flex items-center justify-center mb-5">
          <EmptyCartIcon className="mx-auto text-red" />
        </div>
        <h2 className="pb-5 text-2xl font-medium text-center text-dark">
          Invalid cart total. Please check your cart items.
        </h2>
        <p className="text-center text-gray-600 mb-5">
          Some products may not have prices set. Please remove items without prices or contact support.
        </p>
        <Link
            href="/products"
          className="w-96 mx-auto inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683]"
          style={{ fontFamily: 'Satoshi, sans-serif' }}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return amount > 0 ? (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: convertToSubcurrency(amount),
        currency: "usd",
      }}
    >
      <CheckoutFormProvider
        value={{
          register,
          watch,
          control,
          setValue,
          errors: formState.errors,
          handleSubmit,
        }}
      >
        <CheckoutPaymentArea amount={amount} />
      </CheckoutFormProvider>
    </Elements>
  ) : (
    <CheckoutFormProvider
      value={{
        register,
        watch,
        control,
        setValue,
        errors: formState.errors,
        handleSubmit,
      }}
    >
      <CheckoutAreaWithoutStripe amount={amount} />
    </CheckoutFormProvider>
  );
}
