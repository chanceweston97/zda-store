import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";
import { formatPrice, convertCartPriceToDollars } from "@/utils/price";
import { ButtonArrow } from "@/components/Common/ButtonArrow";

const OrderSummary = () => {
  const {
    cartCount,
    cartDetails,
    totalPrice = 0
  } = useShoppingCart();

  return (
    <div className="lg:max-w-2/5 w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartCount && (
            <>
              {Object.values(cartDetails ?? {}).map((product, key) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-5 border-b border-gray-3"
                >
                  <div>
                    <p className="text-dark">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-dark text-right">
                      ${formatPrice(convertCartPriceToDollars(product.price) * product.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ${totalPrice ? formatPrice(convertCartPriceToDollars(totalPrice)) : '0.00'}
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <Link
            href="/checkout"
            className="group w-full inline-flex items-center justify-center gap-2 rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-6 py-3 transition-all duration-300 ease-in-out hover:bg-[#214683] mt-7.5"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            <ButtonArrow />
            <span>Process to Checkout</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
