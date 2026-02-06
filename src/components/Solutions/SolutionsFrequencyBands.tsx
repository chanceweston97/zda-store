"use client";

const BANDS = [
  // Column 1
  [
    {
      title: "VHF/UHF",
      frequency: "136-174 MHz | 380-520 MHz",
      description:
        "LMR, SCADA/telemetry, and tracking networks requiring reliable long-range links.",
    },
    {
      title: "CBRS",
      frequency: "3550–3700 MHz",
      description:
        "Private LTE and private 5G deployments across enterprise and infrastructure.",
    },
  ],
  // Column 2
  [
    {
      title: "Public Safety",
      frequency: "698-960 MHz",
      description:
        "Public safety and multi-band in-building coverage across large facilities.",
    },
    {
      title: "4G LTE and 5G Sub-6",
      frequency: "600-6000 MHz",
      description:
        "Wideband coverage for in-building and campus deployments at scale.",
    },
  ],
  // Column 3
  [
    {
      title: "ISM Band",
      frequency: "902-928 MHz",
      description:
        "Industrial telemetry and unlicensed fixed links for remote assets and sites.",
    },
    {
      title: "2.4 GHz ISM/Wi-Fi",
      frequency: "2400-2483.5 MHz",
      description:
        "Wi-Fi and 2.4 GHz ISM networks supporting IoT, tracking, and distributed gateways.",
    },
  ],
];

const sectionStyles = {
  fontFamily: "Satoshi, sans-serif",
};

export default function SolutionsFrequencyBands() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 767px) {
              .solutions-frequency-heading { font-size: 26px !important; }
            }
          `,
        }}
      />
    <section
      className="w-full flex flex-col items-start overflow-hidden px-4 sm:px-6 md:px-[50px] gap-[50px] pt-0 pb-12 md:pb-16"
      style={sectionStyles}
    >
      <div className="w-full max-w-[1340px] mx-auto flex flex-col gap-[50px]">
        {/* Heading: 40px Satoshi 400, line-height 60px, letter-spacing -4% – unchanged */}
        <div className="w-full flex flex-col justify-center items-start gap-[25px]">
          <div
            className="w-full break-words solutions-frequency-heading"
            style={{
              color: "black",
              fontSize: "40px",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 400,
              lineHeight: "1.2",
              letterSpacing: "-0.04em",
              wordWrap: "break-word",
            }}
          >
            <span>Our RF infrastructure supports the frequency bands<br /></span>
            <span style={{ color: "#2958A4" }}>connecting</span>
            <span> enterprise, public safety, industrial, and <br />private wireless networks.</span>
          </div>
        </div>

        {/* Band items only: 1240px wide, reduced spacing, responsive */}
        <div className="w-full max-w-[1240px] mx-auto flex flex-col lg:flex-row justify-between items-stretch gap-8 lg:gap-6">
          {BANDS.map((column, colIndex) => (
            <div
              key={colIndex}
              className="flex flex-col justify-start items-start gap-6 md:gap-8 w-full lg:flex-1 lg:min-w-0"
            >
              {column.map((band, bandIndex) => (
                <div
                  key={bandIndex}
                  className="flex flex-col justify-start items-start gap-3 w-full max-w-full lg:max-w-[300px]"
                >
                  <div className="flex flex-col justify-start items-start gap-1.5 sm:gap-2">
                    <div
                      className="text-[#457B9D] font-normal break-words w-full max-w-full"
                      style={{
                        fontSize: "clamp(18px, 2.5vw, 28px)",
                        lineHeight: "clamp(26px, 3.5vw, 34px)",
                        fontFamily: "Satoshi, sans-serif",
                      }}
                    >
                      {band.title}
                    </div>
                    <div
                      className="text-black font-normal break-words w-full max-w-full text-base sm:text-lg"
                      style={{
                        ...sectionStyles,
                        lineHeight: "clamp(24px, 3vw, 34px)",
                      }}
                    >
                      {band.frequency}
                    </div>
                  </div>
                  <div
                    className="w-full max-w-full text-black font-normal break-words text-sm sm:text-base"
                    style={{
                      ...sectionStyles,
                      lineHeight: "clamp(22px, 2.8vw, 26px)",
                    }}
                  >
                    {band.description}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
