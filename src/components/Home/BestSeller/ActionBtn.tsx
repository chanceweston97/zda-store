"use client";
import { CartIcon2, EyeIcon, HeartIcon, HeartSolid } from "@/assets/icons";
import { useEffect, useState } from "react";

const ActionBtn = ({ handleClick, text, icon, addedToWishlist }: any) => {
  const [show, setShow] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div className="flex flex-row-reverse items-center gap-3.5">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={handleClick}
        aria-label="button for quick view"
        className={`relative border border-gray-2 flex items-center justify-center w-9 h-9 rounded-full shadow-xs ease-out duration-200 z-10 ${
          icon === "check-out"
            ? "bg-blue text-white"
            : "text-dark bg-white hover:text-white hover:bg-blue"
        }`}
      >
        {icon === "quick-view" && <EyeIcon className="w-5 h-5" />}

        {icon === "cart" && <CartIcon2 className="w-5 h-5" />}

        {icon === "check-out" && (
          <>
            <svg
              className="absolute right-1 top-1"
              width="10"
              height="7"
              viewBox="0 0 8 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.29707 0.1997C7.56334 0.465966 7.56334 0.89767 7.29707 1.16394L3.66071 4.8003C3.39828 5.06273 2.97414 5.06706 2.70641 4.81004L0.888227 3.06458C0.616583 2.8038 0.607775 2.37219 0.868553 2.10055C1.12933 1.8289 1.56094 1.82009 1.83259 2.08087L3.16885 3.36368L6.33283 0.1997C6.5991 -0.0665666 7.0308 -0.0665666 7.29707 0.1997Z"
                fill="white"
              />
            </svg>

            <CartIcon2 className="w-5 h-5" />
          </>
        )}

        {icon === "wishlist" && (
          <>
            {addedToWishlist ? (
              <HeartSolid className="w-5 h-5" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </>
        )}
      </button>

      <p
        className={`bg-white text-dark text-xs leading-5 font-medium rounded-full px-3 py-1.5 relative shadow-1 self-end capitalize duration-500 ${
          show ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
        }`}
      >
        {addedToWishlist ? <>Added</> : <>{text}</>}
        <span className="inline-block absolute -right-3.5 top-2.5 w-0 h-0 border-[7px] border-solid border-transparent border-l-white"></span>
      </p>
    </div>
  );
};

export default ActionBtn;
