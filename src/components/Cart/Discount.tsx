import CouponForm from "../Checkout/CouponForm";

const Discount = () => {
  return (
    <div className="lg:max-w-3/5 w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
          <h3 className="">Have any discount code?</h3>
        </div>

        <div className="py-8 px-4 sm:px-8.5">
          <div className="flex max-xsm:flex-wrap gap-4 xl:gap-5.5">
            <CouponForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discount;
