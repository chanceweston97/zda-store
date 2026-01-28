import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { InputGroup } from "../ui/input";
import { useCheckoutForm } from "./form";
import { ChevronDown } from "./icons";
import { useCountries } from "@/hooks/useCountries";

export default function Shipping() {
  const [dropdown, setDropdown] = useState(false);
  const { register, control, setValue, watch } = useCheckoutForm();
  const shipToDifferentAddress = watch("shipToDifferentAddress");
  const { countries, getStatesForCountry, hasStateDropdown } = useCountries();
  const selectedShippingCountry = watch("shipping.countryName");
  const statesOrProvinces = getStatesForCountry(selectedShippingCountry);
  const showStateDropdown = hasStateDropdown(selectedShippingCountry);

  useEffect(() => {
    setValue("shipping.stateOrProvince", "");
  }, [selectedShippingCountry, setValue]);

  useEffect(() => {
    if (dropdown) {
      setValue("shipToDifferentAddress", true);
    } else {
      setValue("shipToDifferentAddress", false);
    }
  }, [dropdown, setValue]);

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5 break-inside-avoid">
      <div
        onClick={() => setDropdown(!dropdown)}
        className="cursor-pointer flex items-center gap-2.5 font-medium text-lg text-dark py-5 px-5.5"
      >
        Ship to a different address?
        <ChevronDown
          className={`fill-current ease-out duration-200 ${
            dropdown && "rotate-180"
          }`}
          aria-hidden
        />
      </div>

      {/* <!-- dropdown menu --> */}
      {dropdown && (
        <div className="p-6 border-t border-gray-3">
          <div className="mb-5">
            <label
              htmlFor="shipping-country-name"
              className="block mb-1.5"
            >
              Country
              <span className="text-red">*</span>
            </label>

            <div className="relative">
              <select
                {...register("shipping.countryName", {
                  required: shipToDifferentAddress
                    ? "Country is required"
                    : false,
                })}
                id="shipping-country-name"
                className="w-full bg-gray-1 rounded-[10px] border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-hidden focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(showStateDropdown || selectedShippingCountry) && (
            <div className="mb-5">
              <label htmlFor="shipping-state" className="block mb-1.5">
                State / Province
                {showStateDropdown ? <span className="text-red">*</span> : null}
              </label>
              {showStateDropdown ? (
                <div className="relative">
                  <select
                    {...register("shipping.stateOrProvince", {
                      required: shipToDifferentAddress && showStateDropdown ? "State / Province is required" : false,
                    })}
                    id="shipping-state"
                    className="w-full bg-gray-1 rounded-[10px] border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-hidden focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  >
                    <option value="">Select state / province</option>
                    {statesOrProvinces.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  {...register("shipping.stateOrProvince")}
                  id="shipping-state"
                  placeholder="State / Province (optional)"
                  className="w-full bg-gray-1 rounded-[10px] border border-gray-3 text-dark-4 py-3 pl-5 pr-5 duration-200 outline-hidden focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              )}
            </div>
          )}

          <div className="mb-5">
            <Controller
              control={control}
              name="shipping.address.street"
              render={({ field }) => (
                <InputGroup
                  label="Street Address"
                  placeholder="House number and street name"
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  className="!rounded-[10px]"
                />
              )}
            />

            <div>
              <input
                type="text"
                {...register("shipping.address.apartment")}
                placeholder="Apartment, suite, unit, etc. (optional)"
                className="rounded-[10px] mt-5 border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
            </div>
          </div>

          <div className="mb-5">
            <Controller
              control={control}
              name="shipping.town"
              render={({ field }) => (
                <InputGroup
                  label="City"
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  className="!rounded-[10px]"
                />
              )}
            />
          </div>

          <div className="mb-5">
            <Controller
              control={control}
              rules={{ required: shipToDifferentAddress }}
              name="shipping.zipCode"
              render={({ field, fieldState }) => (
                <InputGroup
                  label="Zip / postal code"
                  placeholder="Enter zip code"
                  required={shipToDifferentAddress}
                  error={!!fieldState.error}
                  errorMessage="Zip code is required"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  className="!rounded-[10px]"
                />
              )}
            />
          </div>

          <div className="mb-5">
            <Controller
              control={control}
              name="shipping.phone"
              render={({ field }) => (
                <InputGroup
                  type="tel"
                  label="Phone"
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  className="!rounded-[10px]"
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="shipping.email"
            render={({ field }) => (
              <InputGroup
                label="Email Address"
                type="email"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                className="!rounded-[10px]"
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
