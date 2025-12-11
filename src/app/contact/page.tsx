import { Metadata } from "next";
import Contact from "@components/Contact";

export const metadata: Metadata = {
  title: "Contact Us | ZDAComm",
  description: "Contact ZDA Communications for support, questions, or inquiries",
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;

