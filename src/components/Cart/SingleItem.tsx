import { TrashIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useShoppingCart } from "use-shopping-cart";
import { formatPrice, convertCartPriceToDollars } from "@/utils/price";

/** Display length: metadata.length may already be "123ft", so don't append "ft" again */
function formatLengthDisplay(length: unknown): string {
  if (length == null || length === "") return "";
  const s = String(length).trim();
  if (s.toLowerCase().endsWith("ft")) return s;
  return `${s}ft`;
}

const SingleItem = ({ item }: any) => {
  const { removeItem, incrementItem, decrementItem } = useShoppingCart();
  const m = item.metadata;
  const cableLabel = m?.cableTypeName ?? m?.cable ?? m?.cableType ?? "";
  const fromLabel = m?.from ?? m?.connector1Name ?? m?.connector1 ?? "";
  const toLabel = m?.to ?? m?.connector2Name ?? m?.connector2 ?? "";

  const handleRemoveFromCart = () => {
    removeItem(item.id);
  };

  const handleIncrement = () => {
    incrementItem(item.id);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      decrementItem(item.id);
    }
  };

  return (
    <tr className="border-t border-gray-3 hover:bg-gray-1/50 transition-colors duration-200">
      <td className="py-5 px-7.5">
        <div className="flex items-center gap-5.5">
          <div className="flex items-center justify-center rounded-lg bg-gray-2 max-w-[80px] w-full h-17.5 flex-shrink-0">
            <Image
              width={200}
              height={200}
              src={item.image}
              alt={item.name}
              className="object-contain max-w-full max-h-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="duration-200 ease-out text-dark hover:text-blue font-medium">
              {item.metadata?.isCustom ? (
                <span>{item.name}</span>
              ) : (
                <Link href={`/products/${item.slug}`} className="hover:underline" prefetch={false}>
                  {item.name}
                </Link>
              )}
            </h3>
            {item.metadata?.isCustom && (
              <div className="mt-1 text-sm text-[#383838]">
                <div>Type: {cableLabel} | Length: {formatLengthDisplay(m?.length)}</div>
                <div>Connectors: {fromLabel} → {toLabel}</div>
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="py-5 px-4">
        <p className="text-dark font-medium">${formatPrice(convertCartPriceToDollars(item.price))}</p>
      </td>

      <td className="py-5 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="flex items-center justify-center rounded-full w-8 h-8 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-gray-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg leading-none">−</span>
          </button>
          <span className="text-dark font-medium min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            aria-label="Increase quantity"
            className="flex items-center justify-center rounded-full w-8 h-8 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-gray-3"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </td>

      <td className="py-5 px-4">
        <p className="text-dark font-semibold">
          ${formatPrice(convertCartPriceToDollars(item.price) * item.quantity)}
        </p>
      </td>

      <td className="py-5 px-7.5">
        <div className="flex justify-end">
          <button
            onClick={() => handleRemoveFromCart()}
            aria-label="Remove product from cart"
            className="flex items-center justify-center rounded-full w-9.5 h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleItem;
