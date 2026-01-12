import { Metadata } from "next";
import Company from "@/components/Company";

export const metadata: Metadata = {
  title: "Company | ZDA Communications",
  description: "Learn about ZDA Communications and our focus on RF hardware since 2008",
  // other metadata
};

const CompanyPage = () => {
  return (
    <>
      <Company />
    </>
  );
};

export default CompanyPage;
