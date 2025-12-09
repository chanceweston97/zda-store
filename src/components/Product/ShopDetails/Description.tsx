"use client";

import Image from "next/image";
import { useState } from "react";

type DescriptionProps = {
  product: any;
  metadata: {
    description?: string | null;
    specifications?: string | null;
    datasheetImage?: string | null;
    datasheetPdf?: string | null;
    features?: string | null; // Plain text, not array
    applications?: string | null; // Plain text, not array
  };
};

export default function Description({ product, metadata }: DescriptionProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specifications">(
    "description"
  );

  const { description, specifications, datasheetImage, datasheetPdf, features, applications } = metadata;

  const forceDownloadUrl = datasheetPdf
    ? `${datasheetPdf}?dl=${product.handle || "datasheet"}.pdf`
    : null;

  return (
    <section className="pb-5 pt-10">
      <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-stretch xl:px-0">
        {/* LEFT COLUMN – DATASHEET */}
        <div className="flex w-full flex-col gap-4 lg:w-[35%]">
          {/* Datasheet preview + button */}
          {datasheetImage && (
            <div className="relative overflow-hidden rounded-[20px] bg-gray-100 h-full flex flex-col">
              <div className="flex-1 relative">
                <Image
                  src={datasheetImage}
                  alt={`${product.title} datasheet`}
                  width={400}
                  height={518}
                  className="h-full w-full object-contain cursor-pointer"
                  onClick={() => {
                    if (!datasheetPdf) return;
                    window.open(datasheetPdf, "_blank", "noopener,noreferrer");
                  }}
                />
              </div>
              <button
                type="button"
                disabled={!datasheetPdf}
                className={`flex w-full items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-8 py-3 transition-colors mt-4 ${
                  datasheetPdf 
                    ? "hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]" 
                    : "cursor-not-allowed bg-[#A1A9C3] opacity-70"
                }`}
              >
                {datasheetPdf ? (
                  <a
                    href={forceDownloadUrl || "#"}
                    download
                    className="w-full h-full flex items-center justify-center"
                  >
                    Download Data Sheet
                  </a>
                ) : (
                  "Download Data Sheet"
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN – TABS + CONTENT */}
        <div className="w-full rounded-[20px] bg-[#F6F7F7] px-6 py-8 lg:w-[65%] lg:px-10 lg:py-10 h-full flex flex-col">
          {/* Tabs */}
          <div className="mb-6 flex w-full justify-center">
            <div className="w-full justify-center inline-flex rounded-full bg-[#E9ECF3] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`w-full px-8 py-2 text-[16px] font-medium leading-[26px] ${
                  activeTab === "description"
                    ? "rounded-full bg-[#2958A4] text-white shadow-sm"
                    : "text-[#2958A4]"
                }`}
              >
                Description
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specifications")}
                className={`w-full px-8 py-2 text-[16px] font-medium leading-[26px] ${
                  activeTab === "specifications"
                    ? "rounded-full bg-[#2958A4] text-white shadow-sm"
                    : "text-[#2958A4]"
                }`}
              >
                Specifications
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="text-[16px] leading-[26px] text-black flex-1">
            {activeTab === "description" ? (
              description ? (
                <div>
                  <div className="font-medium whitespace-pre-line">
                    {description}
                  </div>
                  {(features && features.trim()) || (applications && applications.trim()) ? (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                      {/* FEATURES - Plain text */}
                      {features && features.trim() && (
                        <div className="col-span-1">
                          <h4 className="text-black text-[19px] font-bold leading-7 tracking-[-0.38px]">
                            Features
                          </h4>
                          <div className="mt-2">
                            <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                              {features}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* APPLICATIONS - Plain text */}
                      {applications && applications.trim() && (
                        <div className="col-span-1">
                          <h4 className="text-black text-[19px] font-bold leading-7 tracking-[-0.38px]">
                            Application
                          </h4>
                          <div className="mt-2">
                            <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                              {applications}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p>No description available.</p>
              )
            ) : specifications ? (
              <div className="whitespace-pre-line">{specifications}</div>
            ) : (
              <p>No specifications available.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

