import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function Footer() {
  return (
    <footer className="overflow-hidden">
      <div className="w-full mx-auto bg-[#2958A4] text-white/60 max-w-[1340px] sm:px-6 xl:px-0 shrink-0 self-stretch">
        {/* Footer menu start */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-[50px] xl:pb-15 px-[50px]">
          {/* Company Branding */}
          <div className="max-w-[330px] w-full mt-5 lg:mt-0">
            <div className="mb-7.5 text-custom-1 font-medium text-dark">
              <LocalizedClientLink className="shrink-0" href="/">
                <Image
                  src="/images/logo/logo-white.png"
                  alt="Logo"
                  width={147}
                  height={61}
                />
              </LocalizedClientLink>
            </div>
            <p className="text-white/60 font-satoshi text-lg font-medium leading-[26px] mb-2">
              Field-tested antennas and cabling built to improve signal where it counts.
            </p>
          </div>

          {/* Products Section */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-white">
              Products
            </h2>
            <ul className="flex flex-col gap-3.5">
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/store?category=antennas"
                >
                  Antennas
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/store?category=cables"
                >
                  Cables
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/cable-customizer"
                >
                  Cable Customizer
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/connectors"
                >
                  Connectors
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/store"
                >
                  All
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Get Help Section */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-white">
              Get Help
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/contact"
                >
                  Contact Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/request-a-quote"
                >
                  Request a Quote
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="#"
                >
                  Returns
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="#"
                >
                  FAQ&apos;s
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-white">
              Legal
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/privacy-policy"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/terms-and-conditions"
                >
                  Terms &amp; Conditions
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white"
                  href="/site-map"
                >
                  Site Map
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Hours and Address Section */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-custom-1 font-medium text-white">
              Hours
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white text-white/60"
                  href="#"
                >
                  Mon - Fri : 8:30AM - 5:00PM
                </LocalizedClientLink>
              </li>
            </ul>

            <h2 className="mb-7.5 text-custom-1 font-medium text-white mt-7.5">
              Address
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white text-white/60"
                  href="#"
                >
                  3040 McNaughton Dr. Ste. A<br />
                  Columbia, SC 29223
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white text-white/60"
                  href="mailto:sales@zdacomm.com"
                >
                  sales@zdacomm.com
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="ease-out duration-200 hover:text-white text-white/60"
                  href="tel:18034194702"
                >
                  +1 (803) 419-4702
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>
        {/* Footer menu end */}
      </div>

      {/* Footer Bottom */}
      <div className="">
        <div className="w-full px-4 mx-auto sm:px-6 xl:px-0 bg-[#2958A4] max-w-[1340px] py-5 border-t border-white/30">
          <div className="flex flex-wrap items-center justify-between gap-5 px-[50px]">
            <p className="font-medium text-white/60 text-[16px]">
              © {new Date().getFullYear()} Copyright -{" "}
              <LocalizedClientLink
                className="text-white/60"
                href="/"
              >
                ZDA Communications
              </LocalizedClientLink>
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 text-[20px]">
                {/* Facebook */}
                <a
                  href="#"
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-4 h-4"
                  >
                    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12z" />
                  </svg>
                  Facebook
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-4 h-4"
                  >
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM14.5 9c-2.2 0-3.5 1.2-3.5 3.3V21h4v-7.1c0-.9.6-1.9 2-1.9 1.3 0 1.9.8 1.9 1.9V21h4v-7.6c0-3.7-2-6.4-5.7-6.4z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
