import RequestAQuote from "@/components/RequestAQuote";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Request a Quote | ZDA Communications",
  description: "Request a quote for our products",
  // other metadata
};

const RequestAQuotePage = () => {
  return (
    <main>
      <RequestAQuote />
    </main>
  );
};

export default RequestAQuotePage;
