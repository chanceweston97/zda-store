"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ContactForm = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  productOrService: string;
  message: string;
};

const productServiceOptions = [
  "Select one",
  "Antennas",
  "Cables",
  "XetaWave Radios",
  "Manufacturing",
  "Other"
];

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
      // Call Contact Form 7 API via Next.js API route
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          phone: "", // Phone not required in new design, send empty string
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is not JSON, get text instead
        const errorText = await response.text();
        setIsSubmitting(false);
        console.error("Failed to parse response:", errorText);
        toast.error("Server error: " + (errorText || "Invalid response format"));
        return;
      }

      if (response.ok && result.status === "success") {
        // Success - form submitted to Contact Form 7 and saved in Flamingo
        console.log("✅ Contact form submitted successfully");
        toast.success(result.message || "Contact form submitted successfully!");
        // Redirect to thank you page after successful submission
        router.push("/mail-success");
      } else {
        setIsSubmitting(false);
        // Show error message from Contact Form 7
        const errorMessage = result.message || "Failed to submit your message. Please try again.";
        toast.error(errorMessage);
        console.error("Contact form error response:", result);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error submitting contact form:", error);
      toast.error(error.message || "An error occurred. Please try again later.");
    }
  };

  return (
    <section
      className="mx-auto"
      style={{
        background: 'conic-gradient(from -74deg at 74.37% 54.74%, #FFF 131.53754711151123deg, #70C8FF 162.69198417663574deg, #1870D5 197.30801582336426deg, #70C8FF 295.9637188911438deg, #FFF 330.5797505378723deg)',
        marginTop: '100px',
        width: '1440px',
        padding: '50px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="flex flex-col md:flex-row h-full"
        style={{
          display: 'flex',
          padding: 0,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          alignSelf: 'stretch',
          height: '100%',
          gap: 0
        }}
      >
          {/* LEFT COLUMN — WHITE BACKGROUND */}
        <div className="flex flex-col bg-white w-full md:w-[523px]" style={{ flex: '0 0 auto', padding: 0 }}>
          <div style={{ padding: 0 }}>
            <h1 
              className="text-black text-[66px] leading-[66px] tracking-[-2.64px]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              Contact an <span className="text-[#2958A4]">expert</span>
            </h1>

            <p 
              className="mt-[40px] text-[#000] text-[18px] leading-[28px]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              Contact us with an inquiry or concern and our team will follow up.
            </p>

            <p 
              className="mt-[20px] text-[#000] text-[18px] leading-[28px]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              Businesses and organizations may speak with a product expert to discuss NET 30 terms or tax-exempt pricing.
            </p>

            {/* Email our team section */}
            <div className="mt-[50px]">
              <h3 
                className="text-[#000] text-[20px] leading-[30px] mb-4"
                style={{ fontFamily: 'Satoshi, sans-serif' }}
              >
                Email our team
              </h3>
              
              <div className="flex flex-col gap-4">
                <div>
                  <p 
                    className="text-[#000] text-[18px] leading-[28px] mb-1"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    Sales
                  </p>
                  <a 
                    href="mailto:sales@zdacomm.com"
                    className="text-[18px] underline"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    sales@zdacomm.com
                  </a>
                </div>
                
                <div>
                  <p 
                    className="text-[#000] text-[18px] leading-[28px] mb-1"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    MOTUS
                  </p>
                  <a 
                    href="mailto:leekennedy@zdacomm.com"
                    className="text-[18px] underline"
                    style={{ fontFamily: 'Satoshi, sans-serif' }}
                  >
                    leekennedy@zdacomm.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* RIGHT COLUMN */}
        <div className="flex items-center justify-center w-full md:w-auto" style={{ flex: '0 0 auto', padding: 0 }}>
            {/* Form */}
            <form
              className="relative z-10"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              style={{
                display: 'flex',
                width: '750px',
                maxWidth: '100%',
                padding: '20px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '20px',
                borderRadius: '10px',
                background: '#214683',
                fontFamily: 'Satoshi, sans-serif'
              }}
            >
              {/* First name and Last name in one line */}
              <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <label 
                    className="block mb-2"
                    style={{ 
                      color: '#FFF',
                      fontFamily: 'Satoshi, sans-serif',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '30px'
                    }}
                  >
                    First name <span className="text-white">*</span>
                  </label>
                  <input
                    {...register("firstName", { required: "First name is required" })}
                    className="w-full rounded-[10px] border border-white/30 bg-white px-4 text-[16px] outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                    style={{ fontFamily: 'Satoshi, sans-serif', height: '40px' }}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red">{errors.firstName.message}</p>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <label 
                    className="block mb-2"
                    style={{ 
                      color: '#FFF',
                      fontFamily: 'Satoshi, sans-serif',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '30px'
                    }}
                  >
                    Last name <span className="text-white">*</span>
                  </label>
                  <input
                    {...register("lastName", { required: "Last name is required" })}
                    className="w-full rounded-[10px] border border-white/30 bg-white px-4 text-[16px] outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                    style={{ fontFamily: 'Satoshi, sans-serif', height: '40px' }}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email address */}
              <div style={{ width: '100%' }}>
                <label 
                  className="block mb-2"
                  style={{ 
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px'
                  }}
                >
                  Email address <span className="text-white">*</span>
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                  type="email"
                  className="w-full rounded-[10px] border border-white/30 bg-white px-4 text-[16px] outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                  style={{ fontFamily: 'Satoshi, sans-serif', height: '40px' }}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red">{errors.email.message}</p>
                )}
              </div>

              {/* Company name */}
              <div style={{ width: '100%' }}>
                <label 
                  className="block mb-2"
                  style={{ 
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px'
                  }}
                >
                  Company name
                </label>
                <input
                  {...register("company")}
                  className="w-full rounded-[10px] border border-white/30 bg-white px-4 text-[16px] outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                  style={{ fontFamily: 'Satoshi, sans-serif', height: '40px' }}
                />
              </div>

              {/* Product or service of interest */}
              <div style={{ width: '100%', position: 'relative' }}>
                <label 
                  className="block mb-2"
                  style={{ 
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px'
                  }}
                >
                  Product or service of interest <span className="text-white">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("productOrService", { required: "Please select a product or service" })}
                    className="w-full rounded-[10px] border border-white/30 bg-white px-4 pr-10 text-[16px] outline-none focus:border-white focus:ring-2 focus:ring-white/20 appearance-none"
                    style={{ fontFamily: 'Satoshi, sans-serif', height: '40px' }}
                  >
                    {productServiceOptions.map((option) => (
                      <option key={option} value={option === "Select one" ? "" : option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.productOrService && (
                  <p className="mt-1 text-sm text-red">{errors.productOrService.message}</p>
                )}
              </div>

              {/* Message */}
              <div style={{ width: '100%' }}>
                <label 
                  className="block mb-2"
                  style={{ 
                    color: '#FFF',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '30px'
                  }}
                >
                  Message
                </label>
                <textarea
                  {...register("message")}
                  className="w-full rounded-[10px] border border-white/30 bg-white px-4 py-3 text-[16px] resize-none outline-none focus:border-white focus:ring-2 focus:ring-white/20"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  height: '150px'
                }}
                />
              </div>

              {/* Recaptcha placeholder */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                <div 
                  className="bg-gray-300 text-gray-600 px-6 py-3 rounded-[10px] text-[14px] cursor-pointer"
                  style={{ fontFamily: 'Satoshi, sans-serif' }}
                >
                  Recaptcha
                </div>
              </div>

              {/* Submit button */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                className={`rounded-[10px] px-10 py-3 text-[16px] font-medium transition-all duration-300 ease-in-out ${isSubmitting
                      ? "opacity-70 cursor-not-allowed" 
                      : "hover:opacity-90"
                  }`}
                  style={{ 
                    fontFamily: 'Satoshi, sans-serif',
                    backgroundColor: '#70C8FF',
                    color: '#002D78'
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
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
                    "Submit"
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
    </section>
  );
}
