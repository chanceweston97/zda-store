import Image from "next/image";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/input/radio";
import { useCheckoutForm } from "./form";
import { PaymentElement } from "@stripe/react-stripe-js";

const PaymentMethod = ({ amount }: { amount: number }) => {
  const { register, errors, control, watch } = useCheckoutForm();
  const paymentMethod = watch("paymentMethod");
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {amount > 0 && (
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
                label={<PaymentMethodCard method="cod" />}
              />
            )}
          />

          {/* {amount > 0 && (
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <RadioInput
                  {...field}
                  value="paypal"
                  label={<PaymentMethodCard method="paypal" />}
                />
              )}
            />
          )} */}
        </div>

        {errors.paymentMethod && (
          <p className="mt-2 text-sm text-red">
            Please select a payment method
          </p>
        )}

        {paymentMethod === "bank" && amount > 0 && (
          <div className="mt-5">
            <PaymentElement />
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
// type CardProps = {
//   method: "bank" | "cod" | "paypal";
// };

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
    // paypal: {
    //   name: "Paypal",
    //   image: {
    //     src: "/images/checkout/paypal.svg",
    //     width: 75,
    //     height: 20,
    //   },
    // },
  };

  return (
    <div className="rounded-[10px] border-[0.5px] flex items-center shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2 min-w-[240px]">
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

      {/* {method === 'bank' && (
        
      )} */}
    </div>
  );
}
