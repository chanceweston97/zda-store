"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (!email || !email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success notification only, no redirect
        toast.success(data.message || "Successfully subscribed to newsletter!");
        setEmail(""); // Clear the email field
        setIsLoading(false);
      } else {
        setIsLoading(false);
        toast.error(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Subscription error:", error);
      toast.error(error.message || "An unexpected error occurred. Please check your connection and try again.");
    }
  };

  return (
    <section className="w-full flex justify-center pt-10">
      <div className="w-full max-w-[1340px] bg-gradient-to-b from-[rgba(49,106,197,0)] to-[#2958A4] flex items-center px-[50px] py-[71px]">
        <div className="w-full max-w-[680px] text-center">
          <h2 className="text-[#2958A4] text-center text-5xl lg:text-[60px] font-medium leading-[66px] tracking-[-2.4px]">
            Subscribe For <br /> Latest News Now!
          </h2>

          <p className="mt-[22px] text-[#383838] text-[18px] font-medium leading-7 max-w-[572px] mx-auto">
            &quot;Stay updated with the latest club news, events, and exclusive offers—
            straight to your inbox.&quot;
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex lg:flex-row flex-col items-center justify-center gap-4 max-w-[680px]">
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full max-w-[505px] rounded-[40px] bg-white/80 text-[#383838] px-6 py-2.5 placeholder-[#383838] outline-none"
              required
              disabled={isLoading}
            />

            <button
              type="submit"
              className="inline-flex items-center rounded-full border border-transparent bg-[#2958A4] text-white text-sm font-medium px-6 py-3 transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-[#2958A4] disabled:hover:text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Subscribing...
                </>
              ) : (
                "Subscribe Now"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

