"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ChevronDown } from "./icons";

type Input = {
  email: string;
  password: string;
};

const Login = () => {
  const [dropdown, setDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, formState, ...form } = useForm<Input>();

  const loginUser = async (data: Input) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", { redirect: false, ...data });
      if (res?.error) {
        toast.error(res?.error);
      } else if (res?.ok) {
        toast.success("Sign in Successful!");
        form.reset();

        router.push("/my-account");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mb-9">
      <div
        onClick={() => setDropdown(!dropdown)}
        className={`cursor-pointer flex items-center gap-0.5 py-5 px-5.5 ${
          dropdown && "border-b border-gray-3"
        }`}
      >
        Returning customer?
        <span className="flex items-center gap-2.5 font-medium text-dark pl-1">
          Click here to login
          <ChevronDown
            className={`${dropdown && "rotate-180"} ease-out duration-200`}
          />
        </span>
      </div>

      {/* <!-- dropdown menu --> */}
      <div className="pt-7.5 pb-8.5 px-4 sm:px-8.5" hidden={!dropdown}>
        <p className="text-custom-sm mb-6">
          If you haven&apos;t Logged in, Please Log in first.
        </p>

        <form onSubmit={form.handleSubmit(loginUser)}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2.5 aria-disabled:opacity-70"
              aria-disabled={isLoading}
            >
              Username or Email
            </label>

            <input
              type="email"
              {...register("email", { required: true })}
              id="email"
              className="rounded-[10px] border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-60"
              required
              disabled={isLoading}
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2.5 aria-disabled:opacity-70"
              aria-disabled={isLoading}
            >
              Password
            </label>

            <input
              type="password"
              {...register("password", {
                required: true,
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
              })}
              id="password"
              className="rounded-[10px] border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-60"
              disabled={isLoading}
              required
            />

            {formState.errors.password && (
              <p className="text-sm text-red mt-1.5">
                Minimum 6 characters with 1 uppercase, 1 lowercase, and 1
                number.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex font-medium text-white bg-blue py-3 px-10.5 rounded-full ease-out duration-200 hover:bg-blue-dark disabled:pointer-events-none disabled:opacity-60"
            disabled={isLoading}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
