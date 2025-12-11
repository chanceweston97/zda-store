import { Metadata } from "next";
import RequestAQuote from "@components/RequestAQuote";

export const metadata: Metadata = {
  title: "Request a Quote | ZDAComm",
  description: "Request a quote for our products",
};

const RequestAQuotePage = () => {
  return (
    <main>
      <RequestAQuote />
    </main>
  );
};

export default RequestAQuotePage;

