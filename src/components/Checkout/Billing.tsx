"use client";
import { CheckMarkIcon } from "@/assets/icons";
import { Controller } from "react-hook-form";
import { InputGroup } from "../ui/input";
import { useCheckoutForm } from "./form";
import { ChevronDown } from "./icons";
import { useSession } from "next-auth/react";
import { COUNTRIES } from "@/lib/countries";

export default function Billing() {
  const { register, errors, control } = useCheckoutForm();
  const session = useSession();

  return (
    <div>
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Billing details</h2>

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
          <label
            htmlFor="regionName"
            className="block mb-2.5"
          >
            Country
            <span className="text-red">*</span>
          </label>

          <div className="relative">
            <select
              {...register("billing.regionName", { required: true })}
              id="regionName"
              className="w-full bg-gray-1 rounded-full border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-hidden focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              required
            >
              <option value="" hidden>
                Select your country
              </option>

              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {errors.billing?.regionName && (
            <p className="text-sm text-red mt-1.5">Country is required</p>
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
              className="rounded-full mt-5 border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
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
                label="City"
                required
                error={!!fieldState.error}
                errorMessage="City is required"
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
            name="billing.zipCode"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Zip / postal code"
                placeholder="Enter zip code"
                required
                error={!!fieldState.error}
                errorMessage="Zip code is required"
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
            render={({ field }) => (
              <InputGroup
                label="Country"
                required
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
            rules={{ required: true }}
            name="billing.email"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Email Address"
                type="email"
                required
                error={!!fieldState.error}
                errorMessage="Email is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                readOnly={!!session?.data?.user?.email}
              />
            )}
          />
        </div>

        {!session?.data?.user?.email && (
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

              <div className="rounded border size-4 text-white flex items-center justify-center border-gray-4 peer-checked:bg-blue peer-checked:border-blue [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                <CheckMarkIcon />
              </div>

              <span>Create an Account</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
