import { useGetCategoriesQuery } from "@/redux/features/api/category";
import Link from "next/link";
import { useEffect, useState } from "react";

const CustomSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState({
    title: "All Categories",
  });
  const { data = [] } = useGetCategoriesQuery();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: any) => {
    setSelectedOption(option);
    toggleDropdown();
  };

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: any) {
      if (!event.target.closest(".dropdown-content")) {
        setIsOpen(!isOpen);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="dropdown-content custom-select rounded-full relative"
      style={{ width: "200px" }}
    >
      <div
        className={`select-selected gap-1 whitespace-nowrap  leading-[22px]`}
        onClick={toggleDropdown}
      >
        <div className="flex gap-2 items-center">
          <svg
            className="text-dark"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M3.33398 5L16.6673 5M3.33398 15L16.6673 15M3.33398 10L16.6673 10"
              stroke="#1C274C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-dark font-medium text-sm">
            {selectedOption?.title}
          </span>
        </div>
        <svg
          className={`text-[#2958A4] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M4.3125 7.21875L9 11.9063L13.6875 7.21875"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={"select-items space-y-1"} hidden={!isOpen}>
        {data.map((category) => (
          <div
            key={category._id}
            onClick={() => handleOptionClick(category)}
            className={`select-item ${
              selectedOption === category ? "same-as-selected" : ""
            }`}
          >
            <Link href={`/categories/${(category as any).handle || category.slug?.current || category.slug}`} prefetch={false}>
              {category.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
