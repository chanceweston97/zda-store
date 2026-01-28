"use client";
import { ModalProvider } from "../context/QuickViewModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import CartProvider from "@/components/Providers/CartProvider";
import { AutoOpenCartProvider } from "@/components/Providers/AutoOpenCartProvider";
import { SessionProvider } from "next-auth/react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { SWRConfig } from "swr";

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5000,
  keepPreviousData: true,
  refreshInterval: 0,
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  
  // Only wrap with reCAPTCHA provider if site key is available
  const content = (
    <CartProvider>
      <AutoOpenCartProvider>
        <ModalProvider>
          <PreviewSliderProvider>
            {children}
            <QuickViewModal />
            <CartSidebarModal />
            <PreviewSliderModal />
          </PreviewSliderProvider>
        </ModalProvider>
      </AutoOpenCartProvider>
    </CartProvider>
  );

  return (
    <SWRConfig value={swrOptions}>
      <ReduxProvider>
        <SessionProvider>
          {recaptchaSiteKey ? (
            <GoogleReCaptchaProvider
              reCaptchaKey={recaptchaSiteKey}
              scriptProps={{
                async: false,
                defer: false,
                appendTo: "head",
                nonce: undefined,
              }}
            >
              {content}
            </GoogleReCaptchaProvider>
          ) : (
            content
          )}
        </SessionProvider>
      </ReduxProvider>
    </SWRConfig>
  );
};

export default Providers;
