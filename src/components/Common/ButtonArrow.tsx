// Reusable arrow component for buttons with hover animation
export const ButtonArrow = () => (
  <div className="relative w-[11px] h-[11px] shrink-0 overflow-hidden">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="11" 
      height="11" 
      viewBox="0 0 11 11" 
      fill="none"
      className="absolute inset-0"
    >
      {/* Default arrow - fades out on hover */}
      <path 
        d="M1.1142 1.3858H9.34259M9.34259 1.3858V9.6142M9.34259 1.3858L1.1142 9.6142" 
        stroke="#FBFBFB" 
        strokeWidth="2" 
        className="transition-opacity duration-300 ease-in-out group-hover:opacity-0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Hover arrow - slides in from left */}
      <path 
        d="M1.1142 1.3858H9.34259M9.34259 1.3858V9.6142M9.34259 1.3858L1.1142 9.6142" 
        stroke="#FBFBFB" 
        strokeWidth="2" 
        className="transition-all duration-300 ease-in-out opacity-0 -translate-x-5 group-hover:opacity-100 group-hover:translate-x-0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
