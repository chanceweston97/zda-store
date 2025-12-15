import { WishlistItem } from "@/types/wishlistItem";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Load wishlist items from local storage if available
let initialItemsState: WishlistItem[] = [];

if (typeof window !== "undefined" && window.localStorage) {
  const storedItems = localStorage.getItem("wishlistItems");
  initialItemsState = storedItems ? JSON.parse(storedItems) : [];
}

export const wishlist = createSlice({
  name: "wishlist",
  initialState: { items: initialItemsState },
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const {
        _id,
        name,
        price,
        quantity,
        thumbnails,
        discountedPrice,
        status,
        slug,
      } = action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id,
          name,
          price,
          thumbnails,
          discountedPrice,
          status,
          quantity: 1,
          reviews: [],
          slug,
        });

        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("wishlistItems", JSON.stringify(state.items));
        }
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("wishlistItems", JSON.stringify(state.items));
      }
    },
    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("wishlistItems", JSON.stringify(state.items));
      }
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
