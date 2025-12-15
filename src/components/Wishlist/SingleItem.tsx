import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { imageBuilder } from "@/lib/data/shop-utils";
import { getProductPrice } from "@/utils/getProductPrice";
import { formatPrice } from "@/utils/price";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useShoppingCart } from "use-shopping-cart";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";
import { CircleCheckIcon, CircleXIcon } from "./icons";

const SingleItem = ({ item }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { addItemWithAutoOpen } = useAutoOpenCart();

  const handleRemoveFromWishlist = () => {
    dispatch(removeItemFromWishlist(item._id));
  };

  const productPrice = getProductPrice(item);

  const cartItem = {
    id: item._id || item.price_id,
    name: item.name,
    price: productPrice * 100,
    currency: "usd",
    image: item?.thumbnails
      ? imageBuilder(item?.thumbnails[0]?.image).url()
      : "",
    price_id: item?.price_id,
    slug: item?.slug?.current,
  };

  const handleAddToCart = () => {
    // @ts-ignore
    addItemWithAutoOpen(cartItem);
    toast.success("Product added to cart!");
  };

  return (
    <tr className="hover:bg-gray-1 transition-colors duration-200">
      {/* Remove Button */}
      <td className="py-4 px-6 whitespace-nowrap">
        <button
          onClick={() => handleRemoveFromWishlist()}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
        >
          <span className="sr-only">Remove from wishlist</span>
          <CircleXIcon className="w-4 h-4" />
        </button>
      </td>

      {/* Product Info */}
      <td className="py-4 px-6 whitespace-nowrap">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="flex items-center justify-center rounded-lg bg-gray-2 w-16 h-16 overflow-hidden flex-shrink-0">
            <Image
              src={
                item?.thumbnails
                  ? imageBuilder(item?.thumbnails[0]?.image).url()!
                  : ""
              }
              alt={item.name}
              width={64}
              height={64}
              className="object-cover"
            />
          </div>

          {/* Product Name */}
          <div className="flex-1">
            <h3 className="text-base font-medium text-dark ease-out duration-200 hover:text-blue line-clamp-2">
              <Link href={`/products/${item.slug.current}`}>{item.name}</Link>
            </h3>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="py-4 px-6">
        <p className="text-lg font-semibold text-dark">
          ${formatPrice(productPrice * 100)}
        </p>
      </td>

      {/* Stock Status */}
      <td className="py-4 px-6 whitespace-nowrap">
        {item?.status ? (
          <div className="flex items-center gap-1.5 text-green">
            <CircleCheckIcon className="w-4 h-4" />
            <span className="text-sm font-medium">In Stock</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-red">Out of Stock</span>
        )}
      </td>

      {/* Action */}
      <td className="py-4 px-6 text-right whitespace-nowrap">
        <button
          onClick={() => handleAddToCart()}
          disabled={!item?.status}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
            item?.status
              ? "text-white bg-blue hover:bg-blue-dark shadow-sm hover:shadow-md"
              : "text-gray-4 bg-gray-2 cursor-not-allowed"
          }`}
        >
          Add to Cart
        </button>
      </td>
    </tr>
  );
};

export default SingleItem;
