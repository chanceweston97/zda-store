import Image from "next/image";
import Link from "next/link";

interface SmallPromoBannerProps {
  imageUrl: string;
  subtitle: string;
  title: string;
  discount?: string;
  link: string;
  buttonText: string;
  rightAlign?: boolean;
  bgColor?: string;
  buttonColor?: string;
  description?: string;
}

export default function SmallPromoBanner({
  imageUrl,
  subtitle,
  title,
  discount,
  link,
  buttonText,
  rightAlign = false,
  bgColor = "#DBF4F3",
  buttonColor = "bg-teal hover:bg-teal-dark",
  description,
}: SmallPromoBannerProps) {
  return (
    <div
      className={`relative z-1 overflow-hidden rounded-lg bg-[${bgColor}] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10`}
    >
      <Image
        src={imageUrl}
        alt="promo img"
        className={`sm:absolute sm:top-1/2 sm:-translate-y-1/2 right-10 mx-auto sm:mx-0  ${rightAlign ? "sm:left-10" : ""} -z-1`}
        width={200}
        height={200}
      />
      <div className={`mt-10 sm:mt-0 ${rightAlign ? "sm:text-right" : ""}`}>
        <span className="block text-lg text-dark mb-1.5">{subtitle}</span>
        <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
          {title}
        </h2>
        {description ? (
          <p
            className={`max-w-[200px] xl:max-w-[285px] text-custom-sm mb-2.5 ${rightAlign ? "ml-auto" : ""}`}
          >
            {description}
          </p>
        ) : (
          <p className="font-semibold text-custom-1 text-teal">{discount}</p>
        )}
        <Link
          href={link}
          className={`inline-flex font-medium text-custom-sm text-white ${buttonColor} py-2.5 px-8.5 rounded-full ease-out duration-200 mt-7.5`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
