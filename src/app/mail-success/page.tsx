import { Metadata } from "next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export const metadata: Metadata = {
  title: "Message Sent | ZDAComm",
  description: "Your message has been sent successfully",
};

const MailSuccessPage = () => {
  return (
    <section className="py-20 mt-[108px]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="bg-white rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25 text-center">
          <div className="flex items-center justify-center mb-5">
            <svg
              className="mx-auto text-green-500"
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="50" fill="#F0FDF4" />
              <path
                d="M30 50L42 62L70 34"
                stroke="#22C55E"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="font-bold text-[#2958A4] text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
            Message Sent!
          </h2>

          <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
            Thank You for Contacting Us
          </h3>

          <p className="max-w-[491px] w-full mx-auto mb-7.5 text-gray-600">
            We've received your message and will get back to you as soon as possible. 
            Our team typically responds within 24-48 hours.
          </p>

          <div className="flex justify-center gap-5 flex-wrap">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 font-medium text-white bg-[#2958A4] py-3 px-6 rounded-full ease-out duration-200 hover:bg-[#1F4480] transition-colors"
            >
              Continue Shopping
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#2958A4] bg-white text-[#2958A4] text-sm font-medium px-6 py-3 transition-colors hover:bg-[#2958A4] hover:text-white"
            >
              Send Another Message
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MailSuccessPage;

