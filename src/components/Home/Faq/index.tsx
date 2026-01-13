// src/components/FaqSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonArrowHomepage } from "@/components/Common/ButtonArrowHomepage";

type FaqItem = {
  question: string;
  answer: string;
  order?: number;
};

interface FaqData {
  _id?: string;
  name?: string;
  isActive?: boolean;
  title?: string;
  contactButton?: {
    text: string;
    link: string;
  };
  items?: FaqItem[];
}

interface FaqSectionProps {
  faqData?: FaqData | null;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "What does ZDA Communications specialize in?",
    answer:
      "We design and supply industrial-grade antennas, coaxial cables, and RF accessories engineered for reliable performance in demanding environments.",
    order: 1,
  },
  {
    question: "Which applications are your antennas designed for?",
    answer:
      "Our antennas support fixed wireless, SCADA, utility monitoring, transportation, public safety, and other mission-critical wireless applications.",
    order: 2,
  },
  {
    question: "Do your antennas work with third-party equipment?",
    answer:
      "Yes. Our products are 50-ohm and interface with common radios, modems, hotspots, routers, and signal boosters from major manufacturers, using standard RF connectors.",
    order: 3,
  },
  {
    question: "What connector types are available?",
    answer:
      "N-Female is the standard connector for most of our antennas. We also support SMA, RP-SMA, N-Male, TNC, and other terminations on request.",
    order: 4,
  },
  {
    question: "What is antenna gain and why does it matter?",
    answer:
      "Gain (dBi) indicates how effectively an antenna focuses energy. Higher gain narrows the beam to improve signal at the point of capture or coverage, useful for long or noisy links.",
    order: 5,
  },
  {
    question: "What is VSWR and what are your typical values?",
    answer:
      "VSWR measures impedance match quality. Lower is better. Our antennas are QC-verified to meet ≤ 1.5:1 typical, reducing return loss and protecting connected radios.",
    order: 6,
  },
];

export default function FaqSection({ faqData }: FaqSectionProps) {
  // Fallback values if no data from Sanity
  const title = faqData?.title || "Frequently Asked Questions";
  const contactButton = faqData?.contactButton || {
    text: "Contact Us",
    link: "/contact",
  };

  // Use Sanity data or fallback to defaults
  const faqItems = faqData?.items && faqData.items.length > 0
    ? faqData.items.sort((a, b) => (a.order || 0) - (b.order || 0))
    : DEFAULT_FAQS;

  // Generate IDs for items (using order or index)
  const faqsWithIds = faqItems.map((item, index) => ({
    ...item,
    id: item.order || index + 1,
  }));

  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const leftFaqs = faqsWithIds.filter((x) => x.id % 2 === 1);
  const rightFaqs = faqsWithIds.filter((x) => x.id % 2 === 0);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1340px] px-6 sm:px-0">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[#000] text-[40px] lg:text-[56px] font-normal leading-[45px] sm:leading-[76px] tracking-[-2.24px]">
            {title}
          </h2>

          <Link
            href={contactButton.link}
            className="btn filled group relative inline-flex items-center justify-center rounded-[10px] border border-transparent bg-[#2958A4] text-white text-[14px] sm:text-[16px] font-medium transition-all duration-300 ease-in-out hover:bg-[#214683] hover:active"
            style={{ 
              fontFamily: 'Satoshi, sans-serif',
              padding: '10px 30px',
              paddingRight: '30px',
              cursor: 'pointer',
              minWidth: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.paddingRight = 'calc(30px + 17px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.paddingRight = '30px';
            }}
          >
            <ButtonArrowHomepage />
            <p className="transition-transform duration-300 ease-in-out group-hover:translate-x-[11px] m-0">{contactButton.text}</p>
          </Link>
        </div>

        {/* Two independent columns */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            {leftFaqs.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {rightFaqs.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
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
  item: FaqItem & { id: number };
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
      <div 
        className="flex flex-col transition"
        style={{
          padding: '32px',
          alignSelf: 'stretch',
          borderRadius: '10px',
          border: '1px solid #F2F2F2',
          background: '#FFF'
        }}
      >
        {/* Question */}
        <div className="flex items-center justify-between gap-2">
          <p 
            style={{
              color: '#000',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '20px',
              fontStyle: 'normal',
              lineHeight: '30px',
              letterSpacing: '-0.2px',
              leadingTrim: 'both',
              textEdge: 'cap'
            }}
          >
            {`Q${item.id}: `}
            <span style={{ fontWeight: 400 }}>{item.question}</span>
          </p>

          <span
            className={`flex h-7 w-7 items-center justify-center text-[#2958A4] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path d="M7 8L6.61939 7.62393L0 0.786325L0.761229 0L7 6.44444L13.2388 0L14 0.786325L7.38061 7.62393L7 8Z" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Answer with delayed animation */}
        <div
          className={`mt-2 overflow-hidden transition-all duration-500 ${isOpen
              ? "max-h-40 opacity-100 delay-75"
              : "max-h-0 opacity-0 delay-0"
            }`}
        >
          <p 
            style={{
              color: '#383838',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '28px',
              leadingTrim: 'both',
              textEdge: 'cap'
            }}
          >
            {item.answer}
          </p>
        </div>
      </div>
    </button>
  );
}
