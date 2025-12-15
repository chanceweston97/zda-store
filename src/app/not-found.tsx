import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 mt-10">
      <h1 className="text-[120px] font-bold text-[#2958A4]">404</h1>

      <p className="mt-4 text-[22px] text-[#2958A4] text-center max-w-xl">
        Oops! Something is not right. Let&apos;s get back on track.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2958A4] px-8 py-3 text-[16px] font-medium text-white hover:bg-[#1F4480]"
      >
        Contact Us
      </Link>
    </div>
  );
}

