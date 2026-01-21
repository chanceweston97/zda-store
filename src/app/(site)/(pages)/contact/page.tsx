import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | ZDA Communications",
  description: "This is Contact Page for ZDA Communications",
  // other metadata
};

const ContactPage = async () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
