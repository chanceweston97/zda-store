"use client";
import { useAppSelector } from "@/redux/store";
import Breadcrumb from "../Common/Breadcrumb";
import WishListEmpty from "./WishListEmpty";
import WishListTable from "./WishListTable";
import WishListTopbar from "./WishListTopbar";
import { useEffect, useState } from "react";

export const Wishlist = () => {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        {wishlistItems.length > 0 ? (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 xl:px-0">
            <WishListTopbar />
            <WishListTable wishlistItems={wishlistItems} />
          </div>
        ) : (
          <WishListEmpty />
        )}
      </section>
    </>
  );
};
