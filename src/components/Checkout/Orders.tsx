"use client";

import { HttpTypes } from "@medusajs/types";
import { useCheckoutForm } from "./form";

type OrdersProps = {
  cart: HttpTypes.StoreCart | null;
};

export default function Orders({ cart }: OrdersProps) {
  const { watch } = useCheckoutForm();
  const cartItems = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = watch("shippingMethod");
  const couponDiscount = watch("couponDiscount") || 0;
  const discountAmount = (subtotal * couponDiscount) / 100;
  const total = subtotal + (shippingFee?.price || 0) - discountAmount;

  return (
    <div className="bg-white shadow-1 rounded-[10px] max-lg:mt-7.5">
      <h3 className="font-medium text-xl text-dark border-b border-gray-3 py-5 px-4 sm:px-8.5">
        Your Order
      </h3>

      <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
        <table className="w-full text-dark">
          <thead>
            <tr className="border-b border-gray-3">
              <th className="py-5 text-base font-medium text-left">Product</th>
              <th className="py-5 text-base font-medium text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {cartItems.length > 0 ? (
              cartItems.map((item) => {
                const itemTotal = (item.unit_price || 0) * item.quantity;
                return (
                  <tr key={item.id} className="border-b border-gray-3">
                    <td className="py-5">
                      <span>
                        {item.title} {item.quantity > 1 && `× ${item.quantity}`}
                      </span>
                    </td>
                    <td className="py-5 text-right">${itemTotal.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="py-5 text-center" colSpan={2}>
                  No items in cart
                </td>
              </tr>
            )}

            <tr className="border-b border-gray-3">
              <td className="py-5">Shipping Fee</td>
              <td className="py-5 text-right">
                ${(shippingFee?.price || 0).toFixed(2)}
              </td>
            </tr>

            {couponDiscount > 0 && (
              <tr className="border-b border-gray-3">
                <td className="py-5">Coupon Discount ({couponDiscount}%)</td>
                <td className="py-5 text-right">- ${discountAmount.toFixed(2)}</td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <td className="pt-5 text-base font-medium">Total</td>
              <td className="pt-5 text-base font-medium text-right">
                ${total.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

