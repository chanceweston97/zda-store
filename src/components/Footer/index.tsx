"use client";

import Link from "next/link";
import FooterBottom from "./FooterBottom";
import Image from "next/image";
import ProductsLinks from "./ProductsLinks";
import ConnectLinks from "./ConnectLinks";
import Legal from "./Legal";
import Info from "./Info";
import { useState } from "react";
import toast from "react-hot-toast";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    setIsLoading(true);
    try {
      let recaptchaToken = "";
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha("newsletter_subscribe");
        } catch {
          // continue without token
        }
      }
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          ...(recaptchaToken ? { recaptchaToken } : {}),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Successfully subscribed to newsletter!");
        setEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="overflow-hidden w-full">
      <div
        className="bg-[#2958A4] shrink-0 self-stretch"
        style={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          color: "#fff",
        }}
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-19 xl:justify-between pt-[50px] xl:pb-15 px-[50px]">
            {/* Logo + Newsletter (kept) */}
            <div className="max-w-[400px] w-full mt-5 lg:mt-0">
              <div className="mb-7.5 text-custom-1 text-dark">
                <Link className="shrink-0" href="/">
                  <Image
                    src="/images/logo/logo-white.png"
                    alt="Logo"
                    width={139}
                    height={50}
                  />
                </Link>
              </div>
              <div className="mb-4">
                <p
                  className="text-white text-[16px] mb-3"
                  style={{ fontFamily: "Satoshi, sans-serif", fontWeight: 400, lineHeight: "26px" }}
                >
                  Sign up for our latest newsletters
                </p>
                <form onSubmit={handleSubmit} className="relative w-[400px] h-[50px]">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-full text-white placeholder-white/60 outline-none focus:border-white/50 pr-[85px]"
                    style={{
                      fontFamily: "Satoshi, sans-serif",
                      borderRadius: "10px",
                      border: "0.5px solid #FFF",
                      background: "rgba(41, 88, 164, 0.30)",
                      paddingLeft: "16px",
                      paddingRight: "85px",
                    }}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="absolute right-[5px] top-1/2 -translate-y-1/2 text-[16px] transition-all duration-300 ease-in-out hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "Satoshi, sans-serif",
                      fontWeight: 400,
                      width: "75px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#70C8FF",
                      color: "#002D78",
                      lineHeight: "28px",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer items: PRODUCTS, CONNECT, RESOURCES, HOURS/ADDRESS */}
            <ProductsLinks />
            <ConnectLinks />
            <Legal />
            <Info />
          </div>
        </div>
      </div>

      <FooterBottom />
    </footer>
  );
};

export default Footer;
