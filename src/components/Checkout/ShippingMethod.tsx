import Image from "next/image";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/input/radio";
import { useCheckoutForm } from "./form";

const SHIPPING_METHODS = {
  fedex: {
    name: "Fedex",
    price: 10.99,
    image: "/images/checkout/fedex.svg",
  },
  dhl: {
    name: "DHL",
    price: 12.5,
    image: "/images/checkout/dhl.svg",
  },
};

export default function ShippingMethod() {
  const { errors, control } = useCheckoutForm();

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4">
          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                name={field.name}
                label={
                  <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
                    <div className="flex items-center">
                      <div>
                        <p className="font-semibold text-dark">Standard Shipping</p>
                        <p className="text-custom-xs text-gray-6">Shipped Within 24 Business Hours</p>
                      </div>
                    </div>
                  </div>
                }
                value="free"
                defaultChecked
                onChange={(e) =>
                  field.onChange({
                    name: e.currentTarget.value,
                    price: 0,
                  })
                }
              />
            )}
          />

          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                name={field.name}
                value="fedex"
                label={<ShippingMethodsCard method="fedex" />}
                onChange={(e) =>
                  field.onChange({
                    name: e.currentTarget.value,
                    price: SHIPPING_METHODS.fedex.price,
                  })
                }
              />
            )}
          />

          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                name={field.name}
                value="dhl"
                label={<ShippingMethodsCard method="dhl" />}
                onChange={(e) =>
                  field.onChange({
                    name: e.currentTarget.value,
                    price: SHIPPING_METHODS.dhl.price,
                  })
                }
              />
            )}
          />
        </div>

        {errors.shippingMethod && (
          <p className="mt-2 text-sm text-red">
            Please select a shipping method
          </p>
        )}
      </div>
    </div>
  );
}

function ShippingMethodsCard({ method }: { method: "fedex" | "dhl" }) {
  const data = SHIPPING_METHODS;

  return (
    <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
      <div className="flex items-center">
        <div className="pr-4">
          <Image
            src={data[method].image}
            alt={"Logo of " + data[method].name}
            width={64}
            height={18}
          />
        </div>

        <div className="pl-4 border-l border-gray-4">
          <p className="font-semibold text-dark">${data[method].price}</p>
          <p className="text-custom-xs">Standard Shipping</p>
        </div>
      </div>
    </div>
  );
}
