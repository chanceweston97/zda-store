"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Loader from "@/components/Common/Loader";
import { validateEmail } from "@/lib/validateEmai";
import cn from "@/utils/cn";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");

      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/forgot-password/reset", {
        email,
      });

      if (res.status === 404) {
        toast.error("User not found.");
        setEmail("");
        setLoading(false);
        return;
      }

      if (res.status === 200) {
        toast.success(res.data);
        setLoading(false);
        setEmail("");
      }

      setEmail("");
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data);
    }
  };
  return (
    <>
      <Breadcrumb title={"Forgot Password"} pages={["forgot password"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Forgot Password
              </h2>
              <p>Enter your email below</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                    value={email}
                    required
                    className="rounded-full border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-hidden duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-full ease-out duration-200 hover:bg-blue mt-7.5 items-center gap-2",
                    {
                      "opacity-80 pointer-events-none": loading,
                    }
                  )}
                  disabled={loading}
                >
                  Send email {loading && <Loader />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
