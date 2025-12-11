"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ContactForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          productOrService: "", // Contact form doesn't have product/service
        }),
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
        // Check if email was sent successfully
        if (result.emailStatus) {
          if (result.emailStatus.sent) {
            console.log("✅ Email sent successfully");
          } else {
            console.warn("⚠️ Form submitted but email failed:", result.emailStatus.error);
          }
        }
        toast.success("Message sent successfully!");
        router.push("/mail-success");
      } else {
        setIsSubmitting(false);
        toast.error(result.message || "Failed to submit your message. Please try again.");
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "An error occurred. Please try again later.");
    }
  };

  return (
    <section className="py-20 mt-7">
      <div className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 bg-[#F4F5F7] rounded-[20px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-10">

          {/* LEFT COLUMN — TITLE + DESCRIPTION */}
          <div className="flex flex-col">
            <h1 className="text-[#2958A4] text-[66px] font-medium leading-[66px] tracking-[-2.64px]">
              Contact Us
            </h1>

            <p className="mt-[60px] text-[#000] text-[24px] font-medium leading-[26px]">
              Have a question or need assistance? We're here to help. Reach out to us and we'll get back to you as soon as possible.
            </p>

            <p className="mt-[50px] text-[#000] text-[24px] font-medium leading-[26px]">
              Whether you need technical support, have questions about our products, or want to learn more about our services, our team is ready to assist you.
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

              {/* Submit */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-[#2958A4] px-10 py-3 text-[16px] font-medium text-white shadow-sm transition-colors hover:bg-[#1F4480] disabled:opacity-70 disabled:cursor-not-allowed"
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

