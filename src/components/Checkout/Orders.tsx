import { useShoppingCart } from "use-shopping-cart";
import { useCheckoutForm } from "./form";
import { formatPrice, convertCartPriceToDollars } from "@/utils/price";

export default function Orders() {
  const { watch } = useCheckoutForm();
  const { cartCount, cartDetails, totalPrice = 0 } = useShoppingCart();

  const shippingFee = watch("shippingMethod");
  // totalPrice from use-shopping-cart - convert to dollars using helper
  const totalPriceInDollars = convertCartPriceToDollars(totalPrice);
  const couponDiscount = ((watch("couponDiscount") || 0) * totalPriceInDollars) / 100;

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
              <th className="py-5 text-base font-medium text-right">
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            {cartCount && cartCount > 0 ? (
              Object.values(cartDetails ?? {}).map((product, key) => {
                const productPriceInDollars = convertCartPriceToDollars(product.price);
                const itemTotal = productPriceInDollars * (product.quantity || 1);
                const isCustomCable = product.name?.startsWith("Custom Cable -");
                const formattedName = isCustomCable 
                  ? product.name.replace("Custom Cable -", "").trim()
                  : product.name;
                
                return (
                  <tr key={key} className="border-b border-gray-3">
                    <td className="py-5">
                      {isCustomCable ? (
                        <div className="flex flex-col">
                          <span>Custom Cable :</span>
                          <span>{formattedName} {product.quantity > 1 && `× ${product.quantity}`}</span>
                        </div>
                      ) : (
                        <span>{product.name} {product.quantity > 1 && `× ${product.quantity}`}</span>
                      )}
                    </td>
                    <td className="py-5 text-right">
                      ${formatPrice(itemTotal)}
                    </td>
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
                ${formatPrice(shippingFee?.price || 0)}
              </td>
            </tr>

            {!!couponDiscount && (
              <tr className="border-b border-gray-3">
                <td className="py-5">
                  Coupon Discount ({watch("couponDiscount")}%)
                </td>
                <td className="py-5 text-right">
                  - ${formatPrice(couponDiscount)}
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <td className="pt-5 text-base font-medium">Total</td>

              <td className="pt-5 text-base font-medium text-right">
                ${formatPrice(totalPriceInDollars - couponDiscount + (shippingFee?.price || 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
