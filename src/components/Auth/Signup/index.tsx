"use client";
// Google and GitHub icons - commented out for now
// import { GitHubIcon, GoogleIcon } from "@/assets/icons/social";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Loader from "@/components/Common/Loader";
import cn from "@/utils/cn";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Signup = () => {
  const { register, formState, ...form } = useForm<Input>();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const registerUser = async ({ confirmPassword, ...data }: Input) => {
    setIsLoading(true);

    try {
      await axios.post("/api/register", data);

      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.error(signInRes?.error);
      } else if (signInRes?.ok) {
        toast.success("Sign Up Successful!");
      }

      router.push("/my-account");
      form.reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data || error.message);
      }

      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Sign up"} pages={["Signup"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            {/* Google and GitHub sign up options - commented out for now */}
            {/* <div className="flex flex-col gap-4.5">
              <button
                onClick={() => signIn("google")}
                className="flex justify-center items-center gap-3.5 rounded-full border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                disabled={isLoading}
              >
                <GoogleIcon />
                Sign Up with Google
              </button>

              <button
                onClick={() => signIn("github")}
                className="flex justify-center items-center gap-3.5 rounded-full border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                disabled={isLoading}
              >
                <GitHubIcon />
                Sign Up with Github
              </button>
            </div>

            <span className="relative z-1 block font-medium text-center mt-4.5">
              <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
              <span className="inline-block px-3 bg-white">Or</span>
            </span> */}

            <div className="mt-5.5">
              <form onSubmit={form.handleSubmit(registerUser)}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Full Name <span className="text-red">*</span>
                  </label>

                  <input
                    type="text"
                    {...register("name", { required: true })}
                    id="name"
                    placeholder="John"
                    className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                  />

                  {formState.errors.name && (
                    <p className="text-sm text-red mt-1.5">Name is required</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email Address <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    {...register("email", { required: true })}
                    id="email"
                    placeholder="john@gmail.com"
                    className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                  />

                  {formState.errors.email && (
                    <p className="text-sm text-red mt-1.5">Email is required</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    {...register("password", {
                      required: true,
                      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                    })}
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="on"
                    className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                  />

                  {formState.errors.password && (
                    <p className="text-sm text-red mt-1.5">
                      Minimum 6 characters with 1 uppercase, 1 lowercase, and 1
                      number.
                    </p>
                  )}
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5">
                    Re-type Password <span className="text-red">*</span>
                  </label>

                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: true,

                      validate: (value) =>
                        value === form.getValues("password") ||
                        "Password do not match",
                    })}
                    id="re-type-password"
                    placeholder="Re-type your password"
                    autoComplete="on"
                    className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                  />

                  {formState.errors["confirmPassword"] && (
                    <p className="text-sm text-red mt-1.5">
                      {formState.errors["confirmPassword"].message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-full ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2",
                    {
                      "opacity-80 pointer-events-none": isLoading,
                    }
                  )}
                  disabled={isLoading}
                >
                  Create Account {isLoading && <Loader />}
                </button>

                <p className="text-center mt-6">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-1"
                  >
                    Sign in Now!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
