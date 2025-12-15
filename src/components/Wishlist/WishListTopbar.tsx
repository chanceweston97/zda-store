import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

export default function WishListTopbar() {
  const dispatch = useDispatch<AppDispatch>();


  const handleRemoveFromWishlist = () => {
    dispatch(removeAllItemsFromWishlist());
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
      <h2 className="font-medium text-dark text-2xl">Your Wishlist</h2>
      <button className="text-blue" onClick={handleRemoveFromWishlist}>Clear Wishlist Cart</button>
    </div>
  )
}
