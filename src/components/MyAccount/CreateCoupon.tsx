import { Coupon } from "@/types/coupon";
import { useState } from "react";
import toast from "react-hot-toast";
const CreateCoupon = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const handleCreateCoupon = (e: any) => {
    e.preventDefault();
    // get the form data
    const data = new FormData(e.currentTarget);
    const value = Object.fromEntries(data.entries());

    fetch("/api/coupons/create", {
      method: "POST",
      body: JSON.stringify({
        ...value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCoupons([...coupons, data]);
        toast.success("Coupon created successfully!");
        e.target.reset();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10">
      <h2 className="text-dark font-bold text-xl sm:text-2xl mb-6.5">
        Create Coupon
      </h2>
      <form onSubmit={handleCreateCoupon}>
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="name" className="block mb-2.5">
              Name
            </label>

            <input
              type="text"
              name="name"
              className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="Black Friday"
              required
            />
          </div>

          <div className="w-full">
            <label htmlFor="percent_off" className="block mb-2.5">
              Percent Off
            </label>

            <input
              type="number"
              name="percent_off"
              className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="10"
              required
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="duration" className="block mb-2.5">
              Duration
            </label>

            <input
              type="text"
              name="duration"
              className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              placeholder="repeating, forever or once"
              required
            />
          </div>

          <div className="w-full">
            <label htmlFor="duration_in_months" className="block mb-2.5">
              Duration in months
            </label>

            <input
              type="number"
              name="duration_in_months"
              className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              required
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="max_redemptions" className="block mb-2.5">
              Max Redemptions
            </label>

            <input
              type="number"
              name="max_redemptions"
              className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-full ease-out duration-200 hover:bg-blue-dark"
        >
          Create
        </button>
      </form>

      <div>
        <h2 className="text-dark font-bold text-xl sm:text-2xl mb-6.5 mt-10">
          Coupon codes
        </h2>

        {coupons && coupons?.length ? (
          <>
            <div className="flex items-center justify-between py-4.5 px-7.5 bg-meta">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">#id</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Name</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Discount</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Max Redeptions</p>
              </div>

              <div className="min-w-[58px]">
                <p className="text-custom-sm text-dark">Used</p>
              </div>

              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Promo Code</p>
              </div>
            </div>

            {/* {coupons &&
              coupons?.map((coupon, key) => (
                <div
                  className="flex items-center justify-between border-t border-gray-3 py-5 px-7.5"
                  key={key}
                >
                  <div className="min-w-[111px]">
                    <p className="text-custom-sm text-red">
                      #{coupon?._id.slice(-8)}
                    </p>
                  </div>

                  <div className="min-w-[113px]">
                    <p className="text-custom-sm text-dark">{coupon?.name}</p>
                  </div>
                  <div className="min-w-[128px]">
                    <p className="text-custom-sm text-dark">
                      {coupon?.discount}%
                    </p>
                  </div>
                  <div className="min-w-[128px]">
                    <p className="text-custom-sm text-dark">
                      {coupon?.maxRedemptions}
                    </p>
                  </div>
                  <div className="min-w-[58px]">
                    <p className="text-custom-sm text-dark">
                      {coupon?.timesRedemed}
                    </p>
                  </div>
                  <div className="min-w-[213px]">
                    <p className="text-custom-sm text-dark">{coupon?.code}</p>
                  </div>
                </div>
              ))} */}
          </>
        ) : (
          <p className="text-dark-4">No coupon codes available</p>
        )}
      </div>
    </div>
  );
};

export default CreateCoupon;
