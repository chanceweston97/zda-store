import Image from "next/image";

const paymentsData = [
  {
    id: 1,
    image: "/images/payment/payment-01.svg",
    alt: "visa card",
    width: 33,
  },
  {
    id: 2,
    image: "/images/payment/payment-02.svg",
    alt: "paypal",
    width: 33,
  },
  {
    id: 3,
    image: "/images/payment/payment-03.svg",
    alt: "master card",
    width: 42,
  },
  {
    id: 4,
    image: "/images/payment/payment-04.svg",
    alt: "apple pay",
    width: 50,
  },
  {
    id: 5,
    image: "/images/payment/payment-05.svg",
    alt: "google pay",
    width: 52,
  },
];

export default function FooterBottom() {
  const year = new Date().getFullYear();

  return (
    <div className="">
      <div className="w-full px-4 mx-auto sm:px-6 xl:px-0 bg-[#2958A4] max-w-[1340px] py-5 border-t border-white/30">
        <div className="flex flex-wrap items-center justify-between gap-5 px-[50px]">
          <p className="font-medium text-white/60 text-[16px]">
            &copy; {year} Copyright -{" "}
            <a
              className="text-white/60"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ZDA Communications
            </a>
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {/* <p className="font-medium text-sm text-dark-3">We Accept:</p>

            <div className="flex flex-wrap items-center gap-4">
              {paymentsData.map((payment) => (
                <div
                  key={payment.id}
                  className="  inline-flex items-center justify-center"
                >
                  <Image
                    src={payment.image}
                    alt={payment.alt}
                    width={payment.width}
                    height={20}
                  />
                </div>
              ))}
            </div> */}
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
  );
}
