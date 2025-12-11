import { Metadata } from "next";
import OurStory from "@components/OurStory";

export const metadata: Metadata = {
  title: "Our Story | ZDAComm",
  description: "Learn about ZDA Communications and our focus on RF hardware since 2008",
};

const OurStoryPage = () => {
  return <OurStory />;
};

export default OurStoryPage;

