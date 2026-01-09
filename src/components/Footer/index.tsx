"use client";

import Link from "next/link";
import FooterBottom from "./FooterBottom";
import QuickLinks from "./QuickLinks";
import Image from "next/image";
import ProductsLinks from "./ProductsLinks";
import Legal from "./Legal";
import Info from "./Info";
import { useState } from "react";
import toast from "react-hot-toast";

const Footer = () => {
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
        toast.success(data.message || "Successfully subscribed to newsletter!");
        setEmail("");
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
    <footer className="overflow-hidden w-full">
      <div 
        className="mx-auto bg-[#2958A4] shrink-0 self-stretch"
        style={{
          width: '1440px',
          maxWidth: '100%',
          color: '#fff'
        }}
      >
        {/* <!-- footer menu start --> */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-[50px] xl:pb-15 px-[50px]">
          <div className="max-w-[330px] w-full mt-5 lg:mt-0">
            <div className="mb-7.5 text-custom-1 font-medium text-dark">
              <Link className="shrink-0" href="/">
                <Image
                  src="/images/logo/logo-white.png"
                  alt="Logo"
                  width={147}
                  height={61}
                />
              </Link>
            </div>

            {/* Newsletter Signup Form */}
            <div className="mb-4">
              <p className="text-white text-[16px] mb-3">Sign up for our latest newsletters</p>
              <form onSubmit={handleSubmit} className="relative" style={{ width: '400px', height: '50px' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-full text-white placeholder-white/60 outline-none focus:border-white/50 pr-[85px]"
                  style={{ 
                    fontFamily: 'Satoshi, sans-serif',
                    borderRadius: '10px',
                    border: '0.5px solid #FFF',
                    background: 'rgba(41, 88, 164, 0.30)',
                    paddingLeft: '16px',
                    paddingRight: '85px'
                  }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="absolute right-[5px] top-1/2 -translate-y-1/2 text-[14px] font-medium transition-all duration-300 ease-in-out hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    fontFamily: 'Satoshi, sans-serif',
                    width: '75px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#70C8FF',
                    color: '#000'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Submit"}
                </button>
              </form>
            </div>
          </div>

          <ProductsLinks />

          <QuickLinks />
          <Legal />
          <Info />
        </div>
        {/* <!-- footer menu end --> */}
      </div>

      <FooterBottom />
    </footer>
  );
};

export default Footer;
