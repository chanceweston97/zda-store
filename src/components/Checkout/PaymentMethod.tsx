"use client";

import Image from "next/image";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/RadioInput";
import { useCheckoutForm } from "./form";

// Conditionally import PaymentElement only if Stripe is configured
let PaymentElementWrapper: any = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  try {
    PaymentElementWrapper = require("./PaymentElementWrapper").default;
  } catch {
    // PaymentElementWrapper not available
  }
}

type PaymentMethodProps = {
  amount: number;
  isStripeAvailable?: boolean; // Optional prop to explicitly pass Stripe availability
};

const PaymentMethod = ({ amount, isStripeAvailable: propIsStripeAvailable }: PaymentMethodProps) => {
  const { register, errors, control, watch } = useCheckoutForm();
  const paymentMethod = watch("paymentMethod");
  
  // Check if Stripe is available
  // First check prop, then check environment variable
  // This allows parent components to explicitly control Stripe availability
  const checkStripeFromEnv = () => {
    if (typeof window === 'undefined') return false;
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || key.trim() === '') return false;
    // Validate it's a publishable key (pk_), not a secret key (sk_)
    const trimmedKey = key.trim();
    return trimmedKey.startsWith('pk_');
  };
  
  const isStripeAvailable = propIsStripeAvailable !== undefined 
    ? propIsStripeAvailable 
    : checkStripeFromEnv();

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {amount > 0 && isStripeAvailable && (
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <RadioInput
                  {...field}
                  value="bank"
                  defaultChecked
                  label={<PaymentMethodCard method="bank" />}
                />
              )}
            />
          )}

          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                {...field}
                value="cod"
                defaultChecked={amount <= 0 || !isStripeAvailable}
                label={<PaymentMethodCard method="cod" />}
              />
            )}
          />
        </div>

        {errors.paymentMethod && (
          <p className="mt-2 text-sm text-red">Please select a payment method</p>
        )}

        {paymentMethod === "bank" && amount > 0 && isStripeAvailable && (
          <div className="mt-5">
            {/* PaymentElementWrapper will only work if inside Elements context */}
            {PaymentElementWrapper ? (
              <PaymentElementWrapper />
            ) : (
              <p className="text-sm text-gray-600">
                Stripe payment form loading... If this persists, please refresh the page.
              </p>
            )}
          </div>
        )}
        {paymentMethod === "cod" && (
          <p className="mt-5 text-green">
            You have selected Cash on Delivery. Your order will be processed and
            payment will be collected upon delivery.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;

type CardProps = {
  method: "bank" | "cod";
};

function PaymentMethodCard({ method }: CardProps) {
  const data = {
    bank: {
      name: "Stripe",
      image: {
        src: "/images/checkout/stripe.svg",
        width: 75,
        height: 20,
      },
    },
    cod: {
      name: "Cash on delivery",
      image: {
        src: "/images/checkout/cash.svg",
        width: 21,
        height: 21,
      },
    },
  };

  return (
    <div className="rounded-md border-[0.5px] flex items-center shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2 min-w-[240px]">
      <div className="pr-2.5">
        <Image
          src={data[method].image.src}
          className="shrink-0"
          alt={"Logo of " + data[method].name}
          width={data[method].image.width}
          height={data[method].image.height}
        />
      </div>

      <p className="border-l border-gray-4 pl-2.5">{data[method].name}</p>
    </div>
  );
}

