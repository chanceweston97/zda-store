"use client";

import Link from "next/link";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

export default function CatalogButton() {
  return (
    <Link
      href="/products"
      className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] hover:active"
      style={{ 
        fontFamily: 'Satoshi, sans-serif',
        padding: '10px 30px',
        paddingRight: '30px',
        cursor: 'pointer',
        minWidth: 'fit-content'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.paddingRight = 'calc(30px + 11px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.paddingRight = '30px';
      }}
    >
      <ButtonArrowHomepage />
      <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">Explore Our Products</p>
    </Link>
  );
}
