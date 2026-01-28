import { TrashIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";
import { formatPrice, convertCartPriceToDollars } from "@/utils/price";

const SingleItem = ({ item, toggle }: any) => {
  const { removeItem } = useShoppingCart();

  const handleRemoveFromCart = () => {
    removeItem(item.id);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center w-full gap-6">
          <div className="flex items-center justify-center rounded-[10px] bg-gray-3 max-w-[90px] w-full h-22.5">
            <Image src={item.image} alt="product" width={100} height={100} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="mb-1 font-medium duration-200 ease-out text-dark hover:text-blue">
              {item.metadata?.isCustom ? (
                <span>{item.name}</span>
              ) : (
                <Link onClick={toggle} href={`/products/${item.slug}`} prefetch={false}>
                  {item.name}
                </Link>
              )}
            </h3>
            <p className="text-custom-sm">
              Price: ${formatPrice(convertCartPriceToDollars(item.price))} <span className="text-dark font-medium">x {item.quantity}</span>
            </p>
            {item.metadata?.isCustom && (
              <div className="mt-1 text-xs text-[#383838]">
                {item.metadata.cableType} • {item.metadata.length}ft • {item.metadata.connector1} → {item.metadata.connector2}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleRemoveFromCart}
          aria-label="button for remove product from cart"
          className="flex items-center justify-center rounded-full max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red shrink-0"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Total Display */}
      <div className="flex items-center justify-end">
        <p className="text-dark font-semibold text-sm">
          Total: ${formatPrice(convertCartPriceToDollars(item.price) * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default SingleItem;
