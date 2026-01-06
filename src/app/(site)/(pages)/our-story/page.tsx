import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import OurStory from "@/components/OurStory";

export const metadata: Metadata = {
  title: "Our Story | ZDA Communications",
  description: "Learn about ZDA Communications and our focus on RF hardware since 2008",
  // other metadata
};

const OurStoryPage = () => {
  return (
    <>
      <OurStory />
    </>
  );
};

export default OurStoryPage;

