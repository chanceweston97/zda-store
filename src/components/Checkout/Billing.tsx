"use client";

import { Controller } from "react-hook-form";
import { InputGroup } from "../ui/InputGroup";
import { useCheckoutForm } from "./form";
import { ChevronDown } from "./icons";

export default function Billing() {
  const { register, errors, control } = useCheckoutForm();
  // Note: Session handling removed - can be added later if needed

  return (
    <div>
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 mb-5">
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.firstName"
            render={({ field, fieldState }) => (
              <InputGroup
                label="First Name"
                placeholder="John"
                required
                error={!!fieldState.error}
                errorMessage="First name is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.lastName"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Last Name"
                placeholder="Doe"
                required
                error={!!fieldState.error}
                errorMessage="Last name is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mb-5">
          <Controller
            control={control}
            name="billing.companyName"
            render={({ field }) => (
              <InputGroup
                label="Company Name"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="regionName" className="block mb-2.5">
            Region
            <span className="text-red">*</span>
          </label>

          <div className="relative">
            <select
              {...register("billing.regionName", { required: true })}
              id="regionName"
              className="w-full bg-gray-1 rounded-full border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-hidden focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-[#2958A4]/20"
              required
            >
              <option value="" hidden>
                Select your country
              </option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {errors.billing?.regionName && (
            <p className="text-sm text-red mt-1.5">Region is required</p>
          )}
        </div>

        <div className="mb-5">
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.address.street"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Street Address"
                placeholder="House number and street name"
                required
                error={!!fieldState.error}
                errorMessage="Street address is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div>
            <input
              type="text"
              {...register("billing.address.apartment")}
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="rounded-full mt-5 border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-[#2958A4]/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.town"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Town/City"
                required
                error={!!fieldState.error}
                errorMessage="Town is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mb-5">
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.country"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Country"
                required
                error={!!fieldState.error}
                errorMessage="Country is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mb-5">
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.phone"
            render={({ field, fieldState }) => (
              <InputGroup
                type="tel"
                label="Phone"
                required
                error={!!fieldState.error}
                errorMessage="Phone number is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="mb-5.5">
          <Controller
            control={control}
            rules={{ required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }}
            name="billing.email"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Email Address"
                type="email"
                required
                error={!!fieldState.error}
                errorMessage="Valid email is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="create-account-checkbox"
            className="text-dark flex cursor-pointer items-center space-x-2"
          >
            <input
              type="checkbox"
              {...register("billing.createAccount")}
              id="create-account-checkbox"
              className="sr-only peer"
            />

            <div className="rounded border size-4 text-white flex items-center justify-center border-gray-4 peer-checked:bg-[#2958A4] peer-checked:border-[#2958A4] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <span>Create an Account</span>
          </label>
        </div>
      </div>
    </div>
  );
}

