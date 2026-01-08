import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const metadata: Metadata = {
  title: "Catalog | ZDA Communications",
  description: "ZDA Communications Catalog",
};

const CatalogPage = () => {
  return (
    <>
      <Breadcrumb title="Catalog" />
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-medium mb-4">Catalog</h1>
            <p className="text-gray-600">This page is under construction.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CatalogPage;
