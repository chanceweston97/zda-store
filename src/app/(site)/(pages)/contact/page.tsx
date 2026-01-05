import Contact from "@/components/Contact";
import FaqSection from "@/components/Home/Faq";
import Newsletter from "@/components/Common/Newsletter";
import { getFaq } from "@/lib/data/shop-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | ZDAComm |  Store",
  description: "This is Contact Page for ZDAComm Template",
  // other metadata
};

const ContactPage = async () => {
  const faqData = await getFaq();

  return (
    <main>
      <Contact />
      <FaqSection faqData={faqData} />
      <Newsletter />
    </main>
  );
};

export default ContactPage;
