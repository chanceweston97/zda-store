"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FaqSection from "../Home/Faq";
import Newsletter from "../Common/Newsletter";

type QuoteForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  productOrService: string;
  company: string;
  message: string;
};

interface RequestAQuoteProps {
  variant?: "centered" | "two-column";
  showProductOrService?: boolean;
}

export default function RequestAQuote({ 
  variant = "centered",
  showProductOrService = true 
}: RequestAQuoteProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuoteForm>({
    defaultValues: {
      productOrService: "",
    },
  });

  const onSubmit = async (data: QuoteForm) => {
    setIsSubmitting(true);
    
    // Prepare submit data - ensure productOrService is set correctly
    const submitData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      message: data.message || "",
      productOrService: showProductOrService ? (data.productOrService || "") : "",
    };
    
    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        setIsSubmitting(false);
        toast.error("Server error: Invalid response format");
        return;
      }

      if (response.ok) {
        toast.success("Quote request submitted successfully!");
        reset();
        router.push("/mail-success");
      } else {
        setIsSubmitting(false);
        toast.error(result.message || "Failed to submit quote request. Please try again.");
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error submitting quote request:", error);
      toast.error(error.message || "An error occurred. Please try again later.");
    }
  };

  // Use two-column layout for product detail pages
  const isTwoColumn = variant === "two-column";

  if (isTwoColumn) {
    return (
      <section className="py-10 mt-0">
        <div className="mx-auto w-full max-w-[1340px] px-[50px] bg-[#F4F5F7] rounded-[20px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-10">
            {/* LEFT COLUMN — TITLE + DESCRIPTION */}
            <div className="flex flex-col">
              <h1 className="text-[#2958A4] text-[66px] font-medium leading-[66px] tracking-[-2.64px]">
                Request a Quote
              </h1>

              <p className="mt-[60px] text-[#000] text-[24px] font-medium leading-[26px]">
                Know what you need—or not sure yet? Connect with us for pricing and options.
              </p>

              <p className="mt-[50px] text-[#000] text-[24px] font-medium leading-[26px]">
                Are you a business or organization? Speak to one of our product experts today
                to potentially receive NET30 terms or tax-exempt pricing.
              </p>
            </div>

            {/* RIGHT COLUMN — FORM */}
            <div className="rounded-3xl bg-[#F4F5F7] shadow-md w-full">
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10"
              >
                {/* First row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-black text-[20px] font-medium leading-[30px]">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("firstName", { required: "First name is required" })}
                      placeholder="John"
                      className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-black text-[20px] font-medium leading-[30px]">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("lastName", { required: "Last name is required" })}
                      placeholder="Smith"
                      className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Second row */}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-black text-[20px] font-medium leading-[30px]">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email",
                        },
                      })}
                      placeholder="Enter your email"
                      className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-black text-[20px] font-medium leading-[30px]">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("phone", { required: "Phone number is required" })}
                      placeholder="+1 234 5678"
                      className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Product or Service of Interest - only show if showProductOrService is true */}
                {showProductOrService && (
                  <div className="mt-6">
                    <label className="text-black text-[20px] font-medium leading-[30px]">
                      Product or Service of Interest <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("productOrService", { 
                        required: showProductOrService ? "Product or service is required" : false 
                      })}
                      placeholder="SKU"
                      className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                    />
                    {errors.productOrService && (
                      <p className="mt-1 text-xs text-red-500">{errors.productOrService.message}</p>
                    )}
                  </div>
                )}
                {/* Hidden field for productOrService when not shown */}
                {!showProductOrService && (
                  <input type="hidden" {...register("productOrService")} value="" />
                )}

                {/* Company */}
                <div className="mt-6">
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("company", { required: "Company name is required" })}
                    placeholder="Company name"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                  {errors.company && (
                    <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="mt-6">
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    Message
                  </label>
                  <textarea
                    {...register("message")}
                    rows={6}
                    placeholder="Leave your message"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] resize-none outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                </div>

                {/* Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-10 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Now"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Centered layout for /request-a-quote page
  return (
    <section className="bg-white pt-[109px] mt-2">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* Heading + copy */}
        <div className="text-center">
          <h1 className="text-[#2958A4] text-center text-[66px] font-medium leading-[66px] tracking-[-2.64px]">
            Request a Quote
          </h1>

          <p className="mt-[60px] text-[#2958A4] text-center text-[24px] font-medium leading-[26px]">
            Know what you need—or not sure yet? Connect with us for pricing and options.
          </p>

          <p className="mt-[50px] text-[#2958A4] text-center text-[24px] font-medium leading-[26px]">
            Are you a business or organization? Speak to one of our product experts today
            to potentially receive NET30 terms or tax-exempt pricing.
          </p>
        </div>

        {/* Card */}
        <div className="mt-[50px] flex justify-center">
          <div className="rounded-3xl bg-white shadow-sm w-full max-w-[1000px] border border-[#E5E7EB]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10"
            >
              {/* First row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("firstName", { required: "First name is required" })}
                    placeholder="John"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("lastName", { required: "Last name is required" })}
                    placeholder="Smith"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Second row */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                    placeholder="Enter your email"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    Phone number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone", { required: "Phone number is required" })}
                    placeholder="+1 234 5678"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Product or Service of Interest */}
              {showProductOrService && (
                <div className="mt-6">
                  <label className="text-black text-[20px] font-medium leading-[30px]">
                    Product or Service of Interest <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("productOrService", { 
                      required: showProductOrService ? "Product or service is required" : false 
                    })}
                    placeholder="SKU"
                    className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                  />
                  {errors.productOrService && (
                    <p className="mt-1 text-xs text-red-500">{errors.productOrService.message}</p>
                  )}
                </div>
              )}
              {/* Hidden field for productOrService when not shown */}
              {!showProductOrService && (
                <input type="hidden" {...register("productOrService")} value="" />
              )}

              {/* Company */}
              <div className="mt-6">
                <label className="text-black text-[20px] font-medium leading-[30px]">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("company", { required: "Company name is required" })}
                  placeholder="Company name"
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                />
                {errors.company && (
                  <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="mt-6">
                <label className="text-black text-[20px] font-medium leading-[30px]">
                  Message
                </label>
                <textarea
                  {...register("message")}
                  rows={6}
                  placeholder="Leave your message"
                  className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-[#F6F7F7] px-4 py-3 text-[16px] resize-none outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20"
                />
              </div>

              {/* Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-10 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Now"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <FaqSection />
      <Newsletter />
    </section>
  );
}

