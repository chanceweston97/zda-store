"use client";

import Image from "next/image";
import { useState } from "react";
import { imageBuilder } from "@/lib/data/shop-utils";
import { Product } from "@/types/product";
import { CircleCheckIcon } from "@/assets/icons";

// Helper function to render description/specifications (replaces PortableText)
const renderContent = (content: any): React.ReactNode => {
  if (!content) return null;
  
  // If it's a string, check if it contains HTML
  if (typeof content === 'string') {
    // Check if string contains HTML tags
    const hasHTML = /<[a-z][\s\S]*>/i.test(content);
    if (hasHTML) {
      // Process HTML to ensure proper spacing
      let processedContent = content;
      
      // Check if content contains tables - if so, don't add <br/> tags
      const hasTables = /<table[^>]*>/i.test(content);
      const hasParagraphs = /<p[^>]*>/i.test(content);
      
      // Only replace \n with <br/> for paragraph-based content (descriptions), not for tables
      if (hasParagraphs && !hasTables) {
        // Replace \n with <br/> tags for paragraph content
        processedContent = processedContent.replace(/\n/g, '<br/>');
        // Ensure <p> tags have proper margin-bottom for spacing
        processedContent = processedContent.replace(/<p>/g, '<p style="margin-bottom: 1em;">');
      } else if (hasTables) {
        // For table content, clean up whitespace but don't add <br/> tags
        // Remove excessive newlines and whitespace between tags
        processedContent = processedContent.replace(/>\s+</g, '><');
        // Remove leading/trailing whitespace
        processedContent = processedContent.trim();
      }
      
      // Render HTML using dangerouslySetInnerHTML with proper styling
      // Add table styling for better display
      return (
        <div 
          className="prose max-w-none" 
          style={{ 
            lineHeight: '1.6',
          }}
          dangerouslySetInnerHTML={{ __html: processedContent }} 
        />
      );
    }
    // Plain text - render with line breaks preserved
    return <div className="whitespace-pre-line" style={{ lineHeight: '1.6' }}>{content}</div>;
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
                <p key={index} className="mb-4" style={{ lineHeight: '1.6' }}>
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
          <div key={index} className="mb-4" style={{ lineHeight: '1.6' }}>
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback: stringify objects
  return <div style={{ lineHeight: '1.6' }}>{JSON.stringify(content)}</div>;
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

    // Helper function to fix old IP addresses in URLs
    const fixImageUrl = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return url || null;
      
      // Get current backend URL from environment
      const currentBackendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
                               process.env.MEDUSA_BACKEND_URL || 
                               'http://18.224.229.214:9000';
      
      // Extract the base URL (protocol + hostname + port)
      let currentUrl: URL;
      try {
        currentUrl = new URL(currentBackendUrl);
      } catch (e) {
        return url;
      }
      
      const currentHost = currentUrl.host; // includes port if present
      
      // List of old IPs to replace
      const oldIPs = [
        '18.191.243.236:9000',
        '18.191.243.236',
      ];
      
      let fixedUrl = url;
      
      // Replace old IPs with current backend URL
      for (const oldIP of oldIPs) {
        if (fixedUrl.includes(oldIP)) {
          fixedUrl = fixedUrl.replace(oldIP, currentHost);
          // Also replace http/https if needed to match current protocol
          if (currentUrl.protocol === 'https:' && fixedUrl.startsWith('http://')) {
            fixedUrl = fixedUrl.replace('http://', 'https://');
          } else if (currentUrl.protocol === 'http:' && fixedUrl.startsWith('https://')) {
            fixedUrl = fixedUrl.replace('https://', 'http://');
          }
          break;
        }
      }
      
      return fixedUrl;
    };

    // Get datasheet image and PDF from metadata prop or product
    const datasheetImage = metadata?.datasheetImage || 
                          (product as any).datasheetImage || 
                          (product.metadata as any)?.datasheetImage || 
                          null;
    
    // Fix old IP addresses and use direct URL if it's already a URL, otherwise use imageBuilder
    const datasheetImageUrl = datasheetImage 
        ? (datasheetImage.startsWith('http') ? fixImageUrl(datasheetImage) : imageBuilder(datasheetImage).url())
        : null;

    const datasheetPdfUrl = fixImageUrl(
      metadata?.datasheetPdf || 
      (product as any).datasheetPdf || 
      (product.metadata as any)?.datasheetPdf || 
      (product as any).datasheetPdfUrl || 
      null
    );
    
    // Get features and applications from metadata prop
    const features = metadata?.features || product.features;
    const applications = metadata?.applications || product.applications;
    const specifications = metadata?.specifications || product.specifications;
    console.log("PRODUCTS", product);
    console.log("SPECIFICATIONS:", specifications);
    console.log("SPECIFICATIONS TYPE:", typeof specifications);
    console.log("SPECIFICATIONS IS ARRAY:", Array.isArray(specifications));
    const [imageError, setImageError] = useState(false);

    return (
        <section className="pb-5 pt-10">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-stretch xl:px-0">
                {/* LEFT COLUMN – DATASHEET */}
                <div className="flex w-full flex-col gap-4 lg:w-[35%]">
                    {/* Datasheet preview + button */}
                    {datasheetImageUrl && !imageError ? (
                        <div className="relative overflow-hidden rounded-[20px] bg-gray-100 h-full flex flex-col">
                            <div className="flex-1 relative">
                                <Image
                                    src={datasheetImageUrl}
                                    alt={`${product.name} datasheet`}
                                    width={400}
                                    height={518}
                                    className="h-full w-full object-contain cursor-pointer"
                                    onError={() => setImageError(true)}
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
                    ) : (
                        <div className="relative overflow-hidden rounded-[20px] bg-gray-100 h-full flex flex-col items-center justify-center p-8 min-h-[400px]">
                            <p className="text-gray-500 text-[18px] font-medium text-center">
                                No Datasheet Image Available
                            </p>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
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
                                                            (() => {
                                                                // Check if string contains HTML list
                                                                const hasHTMLList = /<ul|<li/i.test(features);
                                                                if (hasHTMLList) {
                                                                    // Parse HTML and extract list items
                                                                    const parser = new DOMParser();
                                                                    const doc = parser.parseFromString(features, 'text/html');
                                                                    const listItems = doc.querySelectorAll('li');
                                                                    
                                                                    if (listItems.length > 0) {
                                                                        return (
                                                                            <ul className="space-y-2">
                                                                                {Array.from(listItems).map((li, index) => {
                                                                                    const text = li.textContent || li.innerText || '';
                                                                                    return (
                                                                                        <li key={index} className="flex items-start gap-2">
                                                                                            <span className="text-black text-[16px] leading-[24px]">•</span>
                                                                                            <span className="text-black text-[16px] font-medium leading-[26px]">
                                                                                                {text.trim()}
                                                                                            </span>
                                                                                        </li>
                                                                                    );
                                                                                })}
                                                                            </ul>
                                                                        );
                                                                    }
                                                                }
                                                                // Plain text - render as is
                                                                return (
                                                                    <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                                                                        {features}
                                                                    </p>
                                                                );
                                                            })()
                                                        ) : null}
                                                    </div>
                                                </div>
                                            )}

                                            {/* APPLICATIONS */}
                                            {applications && (
                                                <div className="col-span-1">
                                                    <h4 className="text-black text-[19px] font-bold leading-7 tracking-[-0.38px]">
                                                        Applications
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
                                                            (() => {
                                                                // Check if string contains HTML list
                                                                const hasHTMLList = /<ul|<li/i.test(applications);
                                                                if (hasHTMLList) {
                                                                    // Parse HTML and extract list items
                                                                    const parser = new DOMParser();
                                                                    const doc = parser.parseFromString(applications, 'text/html');
                                                                    const listItems = doc.querySelectorAll('li');
                                                                    
                                                                    if (listItems.length > 0) {
                                                                        return (
                                                                            <ul className="space-y-2">
                                                                                {Array.from(listItems).map((li, index) => {
                                                                                    const text = li.textContent || li.innerText || '';
                                                                                    return (
                                                                                        <li key={index} className="flex items-start gap-2">
                                                                                            <span className="text-black text-[16px] leading-[24px]">•</span>
                                                                                            <span className="text-black text-[16px] font-medium leading-[26px]">
                                                                                                {text.trim()}
                                                                                            </span>
                                                                                        </li>
                                                                                    );
                                                                                })}
                                                                            </ul>
                                                                        );
                                                                    }
                                                                }
                                                                // Plain text - render as is
                                                                return (
                                                                    <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                                                                        {applications}
                                                                    </p>
                                                                );
                                                            })()
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
                        ) : activeTab === "specifications" ? (
                            specifications ? (
                                (() => {
                                    console.log("[Specifications Tab] Rendering specifications:", specifications);
                                    
                                    // Handle specifications - can be string, array, or HTML
                                    if (typeof specifications === 'string' && specifications.trim()) {
                                        // Check if string contains HTML (table, list, or other HTML)
                                        const hasHTML = /<[a-z][\s\S]*>/i.test(specifications);
                                        
                                        if (hasHTML) {
                                            // Check if it's an HTML list
                                            const hasHTMLList = /<ul|<li/i.test(specifications);
                                            
                                            if (hasHTMLList) {
                                                // Parse HTML and extract list items
                                                const parser = new DOMParser();
                                                const doc = parser.parseFromString(specifications, 'text/html');
                                                const listItems = doc.querySelectorAll('li');
                                                
                                                if (listItems.length > 0) {
                                                    return (
                                                        <ul className="space-y-2">
                                                            {Array.from(listItems).map((li, index) => {
                                                                const text = li.textContent || li.innerText || '';
                                                                return (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <span className="text-black text-[16px] leading-[24px]">•</span>
                                                                        <span className="text-black text-[16px] font-medium leading-[26px]">
                                                                            {text.trim()}
                                                                        </span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    );
                                                }
                                            }
                                            
                                            // For HTML content (tables, divs, etc.), use renderContent
                                            // This will properly render tables and other HTML elements
                                            // Extract the active tab content if it exists (remove wrapper divs)
                                            let cleanedSpecs = specifications;
                                            
                                            // Extract the active tab content if it exists
                                            if (cleanedSpecs.includes('tab-content is-active') || cleanedSpecs.includes('is-active')) {
                                                try {
                                                    const parser = new DOMParser();
                                                    const doc = parser.parseFromString(cleanedSpecs, 'text/html');
                                                    const activeTab = doc.querySelector('.tab-content.is-active') || doc.querySelector('[class*="is-active"]');
                                                    if (activeTab) {
                                                        // Get the inner HTML of the active tab (the table)
                                                        cleanedSpecs = activeTab.innerHTML;
                                                        console.log("[Specifications] Extracted active tab content:", cleanedSpecs);
                                                    }
                                                } catch (e) {
                                                    console.warn("[Specifications] Error parsing HTML, using original:", e);
                                                }
                                            }
                                            
                                            return (
                                                <>
                                                    <style>{`
                                                        .specifications-content table {
                                                            width: 100%;
                                                            border-collapse: collapse;
                                                            margin-top: 1rem;
                                                            border: 1px solid #ddd;
                                                        }
                                                        .specifications-content table th,
                                                        .specifications-content table td {
                                                            border: 1px solid #ddd;
                                                            padding: 12px;
                                                            text-align: left;
                                                            font-size: 16px;
                                                        }
                                                        .specifications-content table th {
                                                            background-color: #f5f5f5;
                                                            font-weight: 600;
                                                        }
                                                        .specifications-content table tr:nth-child(even) {
                                                            background-color: #f9f9f9;
                                                        }
                                                        .specifications-content table tr:has(td:empty) {
                                                            display: none;
                                                        }
                                                        .specifications-content .tabs-contents {
                                                            display: block;
                                                        }
                                                        .specifications-content .tab-content {
                                                            display: block;
                                                        }
                                                        .specifications-content .tab-content[aria-hidden="true"] {
                                                            display: none !important;
                                                        }
                                                    `}</style>
                                                    <div className="font-medium specifications-content">
                                                        {renderContent(cleanedSpecs)}
                                                    </div>
                                                </>
                                            );
                                        }
                                        
                                        // Plain text
                                        return (
                                            <div className="font-medium">
                                                <p className="text-black text-[16px] font-medium leading-[26px] whitespace-pre-line">
                                                    {specifications}
                                                </p>
                                            </div>
                                        );
                                    }
                                    
                                    // If it's an array
                                    if (Array.isArray(specifications) && specifications.length > 0) {
                                        return (
                                            <ul className="space-y-2">
                                                {specifications.map((spec: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span className="text-black text-[16px] leading-[24px]">•</span>
                                                        <span className="text-black text-[16px] font-medium leading-[26px]">
                                                            {spec}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                    
                                    // Fallback to renderContent for other formats
                                    return (
                                        <div className="font-medium">
                                            {renderContent(specifications)}
                                        </div>
                                    );
                                })()
                            ) : (
                                <p className="text-black text-[16px] font-medium leading-[26px]">
                                    No specifications available.
                                </p>
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
