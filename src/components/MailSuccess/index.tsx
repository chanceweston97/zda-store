import { ArrowLeftIcon } from "@/app/(site)/success/_components/icons";
import Link from "next/link";

const MailSuccess = () => {
  return (
    <>
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 className="font-bold text-blue text-4xl lg:text-[45px] lg:leading-[57px] mb-5">
                Successful!
              </h2>

              <h3 className="font-medium text-dark text-xl sm:text-2xl mb-3">
                Request Submitted Successfully!
              </h3>

              <p className="max-w-[491px] w-full mx-auto mb-7.5">
                Thank you for your request! We&apos;ve received your message and will get back to you as soon as possible.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 rounded-full ease-out duration-200 hover:bg-blue-dark"
              >
                <ArrowLeftIcon />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MailSuccess;
