"use client";

import { useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import type { FAQ } from "@/data/types";

interface FaqData {
  title?: string;
  contactButton?: {
    text: string;
    link: string;
  };
  items?: FAQ[];
}

interface FaqSectionProps {
  faqData?: FaqData | FAQ[] | null;
}

export default function FaqSection({ faqData }: FaqSectionProps) {
  // Handle both array format and object format
  const faqs: FAQ[] = Array.isArray(faqData) 
    ? faqData 
    : (faqData as FaqData)?.items || [];
  
  const title = Array.isArray(faqData) 
    ? "Frequently Asked Questions" 
    : (faqData as FaqData)?.title || "Frequently Asked Questions";
  
  const contactButton = Array.isArray(faqData) 
    ? { text: "Contact Us", link: "/contact" }
    : (faqData as FaqData)?.contactButton || { text: "Contact Us", link: "/contact" };

  // Sort FAQs by order
  const sortedFaqs = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Generate IDs for items (using order or index)
  const faqsWithIds = sortedFaqs.map((item, index) => ({
    ...item,
    displayId: item.order || index + 1,
  }));

  // Split into left and right columns (odd IDs in left, even IDs in right)
  const leftFaqs = faqsWithIds.filter((x) => x.displayId % 2 === 1);
  const rightFaqs = faqsWithIds.filter((x) => x.displayId % 2 === 0);

  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="pb-10">
      <div className="mx-auto max-w-[1340px] px-4 sm:px-6 xl:px-0">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[#2958A4] text-[40px] lg:text-[56px] font-medium leading-[76px] tracking-[-2.24px]">
            {title}
          </h2>

          <LocalizedClientLink
            href={contactButton.link}
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-[#2958A4] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-[#2958A4] hover:bg-white hover:text-[#2958A4]"
          >
            {contactButton.text}
          </LocalizedClientLink>
        </div>

        {/* Two independent columns */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            {leftFaqs.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                isOpen={openId === item.displayId}
                onToggle={() => toggle(item.displayId)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {rightFaqs.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                isOpen={openId === item.displayId}
                onToggle={() => toggle(item.displayId)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Single FAQ row ---------- */

function FaqRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQ & { displayId: number };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full text-left"
    >
      <div className={`flex flex-col rounded-2xl ${isOpen ? "bg-[#f7f7f7]" : "bg-white"} px-5 py-4 shadow-sm transition hover:bg-[#f7f7f7]`}>
        {/* Question */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[#2958A4] font-satoshi text-[20px] font-medium leading-[30px] tracking-[-0.2px]">
            {`Q${item.displayId}: `}
            <span className="font-normal">{item.question}</span>
          </p>

          <span
            className={`flex h-7 w-7 items-center justify-center text-[#2958A4] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path d="M7 8L6.61939 7.62393L0 0.786325L0.761229 0L7 6.44444L13.2388 0L14 0.786325L7.38061 7.62393L7 8Z" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Answer with delayed animation */}
        <div
          className={`mt-2 overflow-hidden text-[14px] leading-6 text-[#383838] transition-all duration-500 ${
            isOpen
              ? "max-h-40 opacity-100 delay-75"
              : "max-h-0 opacity-0 delay-0"
          }`}
        >
          <p className="text-[#383838] font-satoshi text-[18px] font-normal leading-7">{item.answer}</p>
        </div>
      </div>
    </button>
  );
}

