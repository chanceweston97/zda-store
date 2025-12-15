import Image from "next/image";
import Link from "next/link";

interface LargePromoBannerProps {
  imageUrl: string;
  subtitle: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
}

export default function LargePromoBanner({
  imageUrl,
  subtitle,
  title,
  description,
  link,
  buttonText,
}: LargePromoBannerProps) {
  return (
    <div className="relative z-1 overflow-hidden rounded-lg bg-[#F5F5F7] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
      <div className="max-w-[550px] w-full">
        <span className="block font-medium text-xl text-dark mb-3">
          {subtitle}
        </span>
        <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
          {title}
        </h2>
        <p>{description}</p>
        <Link
          href={`/products/${link}`}
          className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-full ease-out duration-200 hover:bg-blue-dark mt-7.5"
        >
          {buttonText}
        </Link>
      </div>
      <Image
        src={imageUrl}
        alt="promo img"
        className="lg:absolute bottom-0 mx-auto right-4 lg:right-26 -z-1 mt-10"
        width={274}
        height={350}
      />
    </div>
  );
}
