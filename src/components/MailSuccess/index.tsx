import { ArrowLeftIcon } from "@/app/(site)/success/_components/icons";
import Link from "next/link";

const MailSuccess = () => {
  return (
    <>
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <h2 
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '50px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '50px',
                  letterSpacing: '-2px',
                  color: '#2958A4',
                  marginBottom: '20px',
                  margin: '0 0 20px 0'
                }}
              >
                Successful!
              </h2>

              <h3 
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '24px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '30px',
                  color: '#000',
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}
              >
                Request Submitted Successfully!
              </h3>

              <p 
                className="max-w-[491px] w-full mx-auto mb-7.5"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#000'
                }}
              >
                Thank you for your request! We&apos;ve received your message and will get back to you as soon as possible.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-6 ease-out duration-200 hover:bg-blue-dark"
                style={{
                  borderRadius: '10px',
                  fontFamily: 'Satoshi, sans-serif'
                }}
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
