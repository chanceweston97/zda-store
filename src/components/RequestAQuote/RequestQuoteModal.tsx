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
  const { isOpen, products, closeRequestQuoteModal, updateProductQuantity } = useRequestQuoteModal();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<QuoteModalForm>({
    defaultValues: {
      quantityForQuote: products.length ? String(products.reduce((s, p) => s + p.quantity, 0)) : "",
    },
  });

  const quantityForQuoteWatched = watch("quantityForQuote");

  useEffect(() => {
    if (products.length > 0) {
      const totalQty = products.reduce((s, p) => s + p.quantity, 0);
      setValue("quantityForQuote", String(totalQty));
    }
  }, [products, setValue]);

  // When user changes quantity in modal, update context so submit sends correct qty and PDP can sync on close
  useEffect(() => {
    if (products.length !== 1 || !quantityForQuoteWatched) return;
    const qty = parseInt(String(quantityForQuoteWatched).trim(), 10);
    if (!Number.isNaN(qty) && qty >= 1) {
      updateProductQuantity(0, qty);
    }
  }, [quantityForQuoteWatched, products.length, updateProductQuantity]);

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
              productSku: p.sku ?? "",
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
        className="fixed left-1/2 top-1/2 z-[10000] w-[calc(100%-24px)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#F6F7F7", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        role="dialog"
        aria-modal
        aria-labelledby="request-quote-title"
      >
        <button
          type="button"
          onClick={closeRequestQuoteModal}
          className="absolute right-3 top-3 w-7 h-7 flex items-center justify-center text-black/70 hover:text-black hover:bg-black/5 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 sm:p-8"
        >
          <div className="flex flex-col items-center text-center gap-1 mb-4">
            <h2
              id="request-quote-title"
              className="text-[28px] sm:text-[32px] leading-tight"
              style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
            >
              <span className="text-black">Request for </span>
              <span className="text-[#2958A4]">Quote</span>
            </h2>
            <p
              className="text-black text-[13px] leading-[20px] max-w-[480px]"
              style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
            >
              Submit your RFQ for lead times, quantity pricing, tax-exempt orders, and Net 30 terms where applicable.
            </p>
          </div>

          <div className="mx-auto w-full space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                  First name*
                </label>
                <input
                  {...register("firstName", { required: "First name is required" })}
                  placeholder=""
                  className="w-full h-[40px] rounded-[8px] bg-white px-4 text-black outline-none"
                  style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
                />
                {errors.firstName && (
                  <p className={errorMessageClass} style={errorMessageStyle}>{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                  Last name*
                </label>
                <input
                  {...register("lastName", { required: "Last name is required" })}
                  placeholder=""
                  className="w-full h-[40px] rounded-[8px] bg-white px-4 text-black outline-none"
                  style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
                />
                {errors.lastName && (
                  <p className={errorMessageClass} style={errorMessageStyle}>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                Email address*
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
                placeholder=""
                type="email"
                className="w-full h-[40px] rounded-[8px] bg-white px-4 text-black outline-none"
                style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
              />
              {errors.email && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                Phone number*
              </label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                placeholder=""
                type="tel"
                className="w-full h-[40px] rounded-[8px] bg-white px-4 text-black outline-none"
                style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
              />
              {errors.phone && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                Company name
              </label>
              <input
                {...register("company", { required: "Company name is required" })}
                placeholder=""
                className="w-full h-[40px] rounded-[8px] bg-white px-4 text-black outline-none"
                style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
              />
              {errors.company && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                SKU
              </label>
              <div className="w-full h-[40px] rounded-[8px] bg-white px-4 flex items-center">
                <span className="text-black text-[16px] leading-[30px]" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                  {products?.[0]?.sku || (products?.[0]?.id ? String(products[0].id) : "—")}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-black text-[15px] sm:text-[16px] leading-[22px] mb-1.5" style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}>
                Quantity
              </label>
              <input
                {...register("quantityForQuote", { required: "Quantity is required" })}
                placeholder=""
                type="number"
                min="1"
                className="w-full h-[40px] rounded-[8px] bg-white px-4 text-black outline-none"
                style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400 }}
              />
              {errors.quantityForQuote && (
                <p className={errorMessageClass} style={errorMessageStyle}>{errors.quantityForQuote.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-[10px] bg-[#2958A4] text-white text-[16px] px-[30px] py-[10px] hover:bg-[#214683] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 500, width: "150px", lineHeight: "26px" }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
