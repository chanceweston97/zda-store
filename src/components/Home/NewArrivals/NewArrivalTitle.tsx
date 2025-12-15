import Link from "next/link";

export default function NewArrivalTitle() {
  return (
    <div className="mb-7 flex items-center justify-between">
      <div>
        <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
          New Arrivals
        </h2>
      </div>

      <Link
        href="/shop"
        className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-full border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
      >
        View All
      </Link>
    </div>
  );
}
