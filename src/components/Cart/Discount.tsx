"use client";

const Discount = () => {
  return (
    <div className="lg:max-w-3/5 w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
          <h3 className="font-medium text-dark">Have any discount code?</h3>
        </div>

        <div className="py-8 px-4 sm:px-8.5">
          <div className="flex max-xsm:flex-wrap gap-4 xl:gap-5.5">
            <input
              type="text"
              placeholder="Enter discount code"
              className="flex-1 px-4 py-3 border border-gray-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2958A4] focus:border-[#2958A4]"
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discount;

