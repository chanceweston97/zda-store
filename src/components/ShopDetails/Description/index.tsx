"use client";

import Image from "next/image";
import { useState } from "react";
import { imageBuilder } from "@/lib/data/shop-utils";
import { Product } from "@/types/product";
import { CircleCheckIcon } from "@/assets/icons";

// Helper function to render description/specifications (replaces PortableText)
const renderContent = (content: any): React.ReactNode => {
  if (!content) return null;
  
  // If it's a string, render it directly
  if (typeof content === 'string') {
    return <div className="whitespace-pre-line">{content}</div>;
  }
  
  // If it's an array, render each item
  if (Array.isArray(content)) {
    if (content.length === 0) return null;
    
    // Check if it's an array of PortableText blocks (objects with _type)
    const isPortableText = content[0] && typeof content[0] === 'object' && '_type' in content[0];
    
    if (isPortableText) {
      // Extract text from PortableText blocks
      return (
        <div>
          {content.map((block: any, index: number) => {
            if (block._type === 'block' && block.children) {
              return (
                <p key={index} className="mb-2">
                  {block.children.map((child: any, childIndex: number) => {
                    if (child.text) {
                      return <span key={childIndex}>{child.text}</span>;
                    }
                    return null;
                  })}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    // If it's an array of strings
    return (
      <div>
        {content.map((item: any, index: number) => (
          <div key={index} className="mb-2">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback: stringify objects
  return <div>{JSON.stringify(content)}</div>;
};

type Props = {
    product: Product;
    metadata?: {
        description?: any;
        specifications?: any;
        datasheetImage?: string | null;
        datasheetPdf?: string | null;
        features?: string | string[] | null;
        applications?: string | string[] | null;
    };
};
export default function Description({ product, metadata }: Props) {
    const [activeTab, setActiveTab] = useState<"description" | "specifications">(
        "description"
    );

    // Get datasheet image and PDF from metadata prop or product
    const datasheetImage = metadata?.datasheetImage || 
                          (product as any).datasheetImage || 
                          (product.metadata as any)?.datasheetImage || 
                          null;
    
    // Use direct URL if it's already a URL, otherwise use imageBuilder
    const datasheetImageUrl = datasheetImage 
        ? (datasheetImage.startsWith('http') ? datasheetImage : imageBuilder(datasheetImage).url())
        : null;

    const datasheetPdfUrl = metadata?.datasheetPdf || 
                           (product as any).datasheetPdf || 
                           (product.metadata as any)?.datasheetPdf || 
                           (product as any).datasheetPdfUrl || 
                           null;
    
    // Get features and applications from metadata prop
    const features = metadata?.features || product.features;
    const applications = metadata?.applications || product.applications;
    const specifications = metadata?.specifications || product.specifications;
    console.log("PRODUCTS", product)
    return (
        <section className="pb-5 pt-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-stretch xl:px-0">
                {/* LEFT COLUMN – DATASHEET */}
                <div className="flex w-full flex-col gap-4 lg:w-[35%]">
                    {/* Datasheet preview + button */}
                    {datasheetImageUrl && (
                        <div className="relative overflow-hidden rounded-[20px] bg-gray-100 h-full flex flex-col">
                            <div className="flex-1 relative">
                                <Image
                                    src={datasheetImageUrl}
                                    alt={`${product.name} datasheet`}
                                    width={400}
                                    height={518}
                                    className="h-full w-full object-contain cursor-pointer"
                                    onClick={() => {
                                        if (!datasheetPdfUrl) return;
                                        window.open(datasheetPdfUrl, "_blank", "noopener,noreferrer");
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!datasheetPdfUrl) return;
                                    
                                    // Use API route to proxy the download (avoids CORS issues)
                                    const downloadUrl = `/api/download-pdf?url=${encodeURIComponent(datasheetPdfUrl)}`;
                                    
                                    // Create a temporary link and trigger download
                                    const link = document.createElement("a");
                                    link.href = downloadUrl;
                                    link.download = `${product.handle || product.slug?.current || "datasheet"}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                disabled={!datasheetPdfUrl}
                                className={`flex w-full items-center justify-center rounded-full border border-transparent bg-[#2958A4] text-white text-[16px] font-medium px-8 py-3 transition-colors mt-4 ${
                                    datasheetPdfUrl 
                                        ? "hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]" 
                                        : "cursor-not-allowed bg-[#A1A9C3] opacity-70"
                                }`}
                            >
                                Download Data Sheet
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
                                className={`w-full px-8 py-2 text-[16px] font-medium leading-[26px] ${activeTab === "description"
                                    ? "rounded-full bg-[#2958A4] text-white shadow-sm"
                                    : "text-[#2958A4]"
                                    }`}
                            >
                                Description
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("specifications")}
                                className={`w-full px-8 py-2 text-[16px] font-medium leading-[26px] ${activeTab === "specifications"
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
                            (metadata?.description || product.description) ? (
                                <div>
                                    <div className="font-medium">
                                        {renderContent(metadata?.description || product.description)}
                                    </div>
                                    {/* Features and Applications from admin panel (metadata) */}
                                    {(features || applications) && (
                                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                                            {/* FEATURES */}
                                            {features && (
                                                <div className="col-span-1">
                                                    <h4 className="text-black text-[19px] font-bold leading-7 tracking-[-0.38px]">
                                                        Features
                                                    </h4>
                                                    <div className="mt-2">
                                                        {Array.isArray(features) && features.length > 0 ? (
                                                            <ul className="space-y-2">
                                                                {features.map((feature: string, index: number) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <span className="text-black text-[16px] leading-[24px]">•</span>
                                                                        <span className="text-black text-[16px] font-medium leading-[26px]">
                                                                            {feature}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : typeof features === 'string' && features.trim() ? (
                                                            <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                                                                {features}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            )}

                                            {/* APPLICATIONS */}
                                            {applications && (
                                                <div className="col-span-1">
                                                    <h4 className="text-black text-[19px] font-bold leading-7 tracking-[-0.38px]">
                                                        Application
                                                    </h4>
                                                    <div className="mt-2">
                                                        {Array.isArray(applications) && applications.length > 0 ? (
                                                            <ul className="space-y-2">
                                                                {applications.map((application: string, index: number) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <span className="text-black text-[16px] leading-[24px]">•</span>
                                                                        <span className="text-black text-[16px] font-medium leading-[26px]">
                                                                            {application}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : typeof applications === 'string' && applications.trim() ? (
                                                            <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                                                                {applications}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>No description available.</p>
                            )
                        ) : specifications ? (
                            renderContent(specifications)
                        ) : (
                            <p>No specifications available.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
