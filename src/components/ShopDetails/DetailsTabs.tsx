"use client";
import { Product } from "@/types/product";
import { PortableText } from "@portabletext/react";
import { useState } from "react";
import AdditionalInformation from "./AdditionalInformation";
import Reviews from "./Reviews";

const DetailsTabs = ({ product }: { product: Product }) => {
  const [activeTab, setActiveTab] = useState("tabOne");

  const tabs = [
    {
      id: "tabOne",
      title: "Description",
    },
    {
      id: "tabTwo",
      title: "Additional Information",
    },
    {
      id: "tabThree",
      title: "Reviews",
    },
  ];

  return (
    <section className="py-20 overflow-hidden bg-gray-2">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0 ">
        {/* <!--== tab header start ==--> */}
        <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
          {tabs.map((item, key) => (
            <button
              key={key}
              onClick={() => setActiveTab(item.id)}
              className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${
                activeTab === item.id
                  ? "text-blue before:w-full"
                  : "text-dark before:w-0"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
        {/* <!--== tab header end ==--> */}

        {/* <!--== tab content start ==--> */}
        {/* <!-- tab content one start --> */}
        <div>
          <div
            className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${
              activeTab === "tabOne" ? "flex" : "hidden"
            }`}
          >
            <div className="max-w-[670px] w-full">
              <h2 className="text-2xl font-medium text-dark mb-7">
                Specifications:
              </h2>

              <div className="leading-7 text-base text-gray-6">
                <PortableText value={product?.description!} />
              </div>
            </div>
          </div>
        </div>
        {/* <!-- tab content one end --> */}

        {/* <!-- tab content two start --> */}
        <div
          className={`rounded-xl bg-white shadow-1 p-4 sm:p-6 mt-10 ${
            activeTab === "tabTwo" ? "block" : "hidden"
          }`}
        >
          {product?.additionalInformation?.length ? (
            <AdditionalInformation
              additionalInformation={product?.additionalInformation}
            />
          ) : (
            <p className="">No additional information available!</p>
          )}
        </div>
        {/* <!-- tab content two end --> */}

        {/* <!-- tab content three start --> */}
        <div
          className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${
            activeTab === "tabThree" ? "flex" : "hidden"
          }`}
        >
          <Reviews product={product} />
        </div>
        {/* <!-- tab content three end --> */}
        {/* <!--== tab content end ==--> */}
      </div>
    </section>
  );
};

export default DetailsTabs;
