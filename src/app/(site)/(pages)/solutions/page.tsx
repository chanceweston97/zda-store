import { Metadata } from "next";
import Solutions from "@/components/Solutions";

export const metadata: Metadata = {
  title: "Solutions | ZDA Communications",
  description: "RF connectivity solutions – antennas, cables, connectors, and more",
};

const SolutionsPage = () => {
  return (
    <>
      <Solutions />
    </>
  );
};

export default SolutionsPage;
