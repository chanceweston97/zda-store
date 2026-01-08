// Homepage-specific arrow component - matches Credo structure exactly: two paths, svg-wrapper, appears 1 letter beside text
export const ButtonArrowHomepage = () => (
  <div className="filled-svg svg-wrapper cta-link relative w-0 h-[11px] overflow-visible opacity-0 group-hover:w-[11px] group-hover:opacity-100 transition-all shrink-0" style={{ transitionDuration: '150ms', transitionTimingFunction: 'ease-in' }}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="11" 
      height="11" 
      viewBox="0 0 11 11" 
      fill="none"
      className="min-w-[11px]"
    >
      {/* Path 1 - visible by default, fades out on hover */}
      <path 
        d="M1.1142 1.3858H9.34259M9.34259 1.3858V9.6142M9.34259 1.3858L1.1142 9.6142" 
        stroke="currentColor" 
        strokeWidth="2" 
        className="path-1 transition-opacity opacity-100 group-hover:opacity-0"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transitionDuration: '150ms', transitionTimingFunction: 'ease-in' }}
      />
      {/* Path 2 - hidden by default, flies in from bottom-left to top-right on hover */}
      <path 
        d="M1.1142 1.3858H9.34259M9.34259 1.3858V9.6142M9.34259 1.3858L1.1142 9.6142" 
        stroke="currentColor" 
        strokeWidth="2" 
        className="path-2 transition-[opacity,transform] opacity-0 translate-x-[-25px] translate-y-[25px] group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <style dangerouslySetInnerHTML={{__html: `
      .group:hover .path-2 {
        transition-delay: 150ms;
        transition-duration: 500ms;
        transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      .group:not(:hover) .path-2 {
        transition-delay: 0ms;
        transition-duration: 150ms;
        transition-timing-function: ease-in;
      }
      .group:hover .cta-link {
        transition-delay: 150ms;
        transition-duration: 500ms;
      }
      .group:not(:hover) .cta-link {
        transition-delay: 0ms;
        transition-duration: 150ms;
      }
    `}} />
  </div>
);
