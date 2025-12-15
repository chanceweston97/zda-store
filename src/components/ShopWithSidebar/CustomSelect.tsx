import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const options = [
  { label: "Latest Products", value: "latest" },
  { label: "Best Selling", value: "popular" },
];

export default function CustomSelect() {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const pathname = usePathname();

  const selected = options.find(
    (option) => option.value === searchParams.get("sort")
  );

  const [selectedOption, setSelectedOption] = useState(selected || options[0]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: (typeof options)[number]) => {
    const params = new URLSearchParams(searchParams);

    if (option.value !== params.get("sort")) {
      params.set("sort", option.value);
    }

    setSelectedOption(option);
    setIsOpen(false);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    // Add a click event listener to the document
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative custom-select custom-select-2 shrink-0"
      ref={dropdownRef}
    >
      {/* <button
        className={`select-selected whitespace-nowrap text-left min-w-[152px] !text-dark-4 !font-normal ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
      </button> */}

      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption.label === option.label
                ? "!bg-gray-1 !text-dark"
                : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
