import React from "react";
import { useAutoOpenCart } from "../Providers/AutoOpenCartProvider";

const CartAutoOpenToggle: React.FC = () => {
  const { isAutoOpenEnabled, setAutoOpenEnabled } = useAutoOpenCart();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="auto-open-toggle"
        className="text-sm text-gray-600 cursor-pointer"
      >
        Auto-open cart
      </label>
      <button
        id="auto-open-toggle"
        onClick={() => setAutoOpenEnabled(!isAutoOpenEnabled)}
        className={`
          relative inline-flex h-5 w-8 items-center rounded-full transition-colors
          ${isAutoOpenEnabled ? "bg-blue" : "bg-gray-300"}
        `}
        aria-label="Toggle auto-open cart"
      >
        <span
          className={`
            inline-block h-3 w-3 transform rounded-full bg-white transition-transform
            ${isAutoOpenEnabled ? "translate-x-4" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
};

export default CartAutoOpenToggle;
