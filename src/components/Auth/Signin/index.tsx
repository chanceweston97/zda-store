"use client";
// Google and GitHub icons - commented out for now
// import { GitHubIcon, GoogleIcon } from "@/assets/icons/social";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Loader from "@/components/Common/Loader";
import cn from "@/utils/cn";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  email: string;
  password: string;
};

const Signin = () => {
  const { handleSubmit, register, formState, reset } = useForm<Input>();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const loginUser = (data: Input) => {
    setIsLoading(true);

    signIn("credentials", { redirect: false, ...data })
      .then((callback) => {
        if (callback?.error) {
          toast.error(callback?.error);
        } else if (callback?.ok) {
          toast.success("Sign in Successful!");
          reset();

          router.push("/my-account");
        }
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Breadcrumb title={"Sign in"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit(loginUser)}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>

                  <input
                    type="email"
                    {...register("email", { required: true })}
                    id="email"
                    placeholder="example@gmail.com"
                    className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                  />

                  {formState.errors.email && (
                    <p className="text-sm text-red mt-1.5">Email is required</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password
                  </label>

                  <input
                    type="password"
                    {...register("password", {
                      required: true,
                      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                    })}
                    id="password"
                    placeholder="Enter your password"
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
                  Sign in {isLoading && <Loader />}
                </button>

                <Link
                  href="/forgot-password"
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Forgot your password?
                </Link>

                {/* Google and GitHub sign in options - commented out for now */}
                {/* <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Or</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <button
                    type="button"
                    onClick={() =>
                      signIn("google", { callbackUrl: "/my-account" })
                    }
                    className="flex justify-center items-center gap-3.5 rounded-full border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                    disabled={isLoading}
                  >
                    <GoogleIcon />
                    Sign In with Google
                  </button>

                  <button
                    onClick={() =>
                      signIn("github", { callbackUrl: "/my-account" })
                    }
                    type="button"
                    className="flex justify-center items-center gap-3.5 rounded-full border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:text-dark hover:bg-gray-2 disabled:pointer-events-none disabled:opacity-60"
                    disabled={isLoading}
                  >
                    <GitHubIcon />
                    Sign In with Github
                  </button>
                </div> */}

                <p className="text-center mt-6">
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-1"
                  >
                    Sign Up Now!
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

export default Signin;
