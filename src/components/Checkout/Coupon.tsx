import CouponForm from "./CouponForm";

export default function Coupon() {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5 -order-1">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have any Coupon Code?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
