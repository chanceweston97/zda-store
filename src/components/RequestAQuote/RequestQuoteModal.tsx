"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useRequestQuoteModal } from "@/app/context/RequestQuoteModalContext";

type QuoteModalForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  quantityForQuote: string;
};

const inputBase =
  "w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 text-[16px] text-black placeholder:text-gray-400 outline-none focus:border-[#2958A4] focus:ring-2 focus:ring-[#2958A4]/20";
const labelClass = "block text-black text-[16px] font-semibold leading-[30px] mb-1";
const errorMessageClass = "mt-1 text-xs font-medium";
const errorMessageStyle = { color: "#dc2626" } as const;

export default function RequestQuoteModal() {
  const { isOpen, products, closeRequestQuoteModal } = useRequestQuoteModal();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<QuoteModalForm>({
    defaultValues: {
      quantityForQuote: products.length ? String(products.reduce((s, p) => s + p.quantity, 0)) : "",
    },
  });

  useEffect(() => {
    if (products.length > 0) {
      const totalQty = products.reduce((s, p) => s + p.quantity, 0);
      setValue("quantityForQuote", String(totalQty));
    }
  }, [products, setValue]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRequestQuoteModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeRequestQuoteModal]);

  const onSubmit = async (data: QuoteModalForm) => {
    setIsSubmitting(true);

    const quantityForQuote = data.quantityForQuote?.trim() || "";

    const submitData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      quantityForQuote: quantityForQuote || undefined,
      productOrService:
        products.length > 0
          ? products.map((p) => `${p.title} (ID: ${p.id})`).join("; ")
          : "(Not specified)",
      message: quantityForQuote ? `Quantity for Quote: ${quantityForQuote}` : "",
      products:
        products.length > 0
          ? products.map((p) => ({
              productId: String(p.id),
              productUrl: p.url ?? "",
              productTitle: p.title,
              productPrice: p.price,
              quantity: p.quantity,
            }))
          : undefined,
    };

    try {
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.status === "success") {
        toast.success(result.message || "Quote request submitted successfully!");
        reset();
        closeRequestQuoteModal();
        router.push("/mail-success");
      } else {
        toast.error(result.message || "Failed to submit quote request. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop: a little dark, disabled look – modal stays light */}
      <div
        className="fixed inset-0 z-[9999] backdrop-blur-[2px] cursor-pointer"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        aria-hidden
        onClick={closeRequestQuoteModal}
      />
      <div
        className="fixed left-1/2 top-1/2 z-[10000] w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] overflow-hidden shadow-2xl bg-white"
        style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        role="dialog"
        aria-modal
        aria-labelledby="request-quote-title"
      >
        {/* Header – brand blue */}
        <div
          className="flex items-center justify-center relative py-4 px-6"
          style={{ backgroundColor: "#2958A4" }}
        >
          <h2
            id="request-quote-title"
            className="text-white text-[18px] sm:text-[20px] font-medium uppercase tracking-wide"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Get a Quote
          </h2>
          <button
            type="button"
            onClick={closeRequestQuoteModal}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 sm:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className={labelClass} style={{ fontFamily: "Satoshi, sans-serif" }}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName", { required: "First name is required" })}
                placeholder="First Name"
                className={inputBase}
              />
              {errors.firstName && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "Satoshi, sans-serif" }}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName", { required: "Last name is required" })}
                placeholder="Last Name"
                className={inputBase}
              />
              {errors.lastName && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
            <div>
              <label className={labelClass} style={{ fontFamily: "Satoshi, sans-serif" }}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                placeholder="Phone Number"
                type="tel"
                className={inputBase}
              />
              {errors.phone && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "Satoshi, sans-serif" }}>
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
                type="email"
                className={inputBase}
              />
              {errors.email && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
            <div>
              <label className={labelClass} style={{ fontFamily: "Satoshi, sans-serif" }}>
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("company", { required: "Company name is required" })}
                placeholder="Company"
                className={inputBase}
              />
              {errors.company && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.company.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "Satoshi, sans-serif" }}>
                Quantity for Quote <span className="text-red-500">*</span>
              </label>
              <input
                {...register("quantityForQuote", { required: "Quantity is required" })}
                placeholder="Quantity"
                type="number"
                min="1"
                className={inputBase}
              />
              {errors.quantityForQuote && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.quantityForQuote.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#2958A4] text-white text-[16px] font-medium uppercase tracking-wide px-6 py-3 hover:bg-[#214683] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              {isSubmitting ? "Submitting..." : "Get a Quote"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
