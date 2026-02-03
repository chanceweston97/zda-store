import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";
import OurStory from "@/components/OurStory";

/** Fetch FAQ/partners/our-story at runtime so Cloudflare doesn’t block WordPress at build time. */
export const dynamic = "force-dynamic";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Company | ZDA Communications",
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

