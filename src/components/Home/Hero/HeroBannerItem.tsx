import { imageBuilder } from "@/lib/data/shop-utils";
import Image from "next/image";
import Link from "next/link";

export default function HeroBannerItem({
  bannerItem,
  className,
}: {
  bannerItem: any;
  className?: string;
}) {
  return (
    <div
      className={`w-full relative rounded-[10px] px-6 py-4 sm:py-5 sm:px-7  ${className}`}
    >
      <div className="flex  justify-between gap-4">
        <div className="max-w-[153px] flex flex-col justify-between w-full">
          <h2 className="max-w-[153px] font-semibold text-dark text-[22px]   hover:text-blue">
            <Link href={`/products/${bannerItem?.product?.slug.current}`} prefetch={false}>
              {bannerItem.name}{" "}
            </Link>
          </h2>
          <div>
            <span className="flex items-center  gap-1 text-lg">
              <span className="font-medium text-dark text-custom-sm ">
                Save up to
              </span>
              <span className="font-semibold text-lg text-blue">
                ${bannerItem?.product?.discountedPrice}
              </span>
            </span>
          </div>
        </div>

        <div className="max-w-[180px] w-full">
          <Image
            src={imageBuilder(bannerItem?.image).url()!}
            alt="mobile image"
            width={180}
            height={210}
          />
        </div>
      </div>
    </div>
  );
}
