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
    <section
      className="w-full flex flex-col items-start overflow-hidden px-4 sm:px-6 md:px-[50px] gap-[50px] py-12 md:py-16"
      style={sectionStyles}
    >
      <div className="w-full max-w-[1340px] mx-auto flex flex-col gap-[50px]">
        {/* Heading: 40px Satoshi 400, line-height 60px; “connecting” in #2958A4 */}
        <div className="w-full flex flex-col justify-center items-start gap-[25px]">
          <div
            className="w-full break-words"
            style={{
              color: "black",
              fontSize: "40px",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 400,
              lineHeight: "60px",
              wordWrap: "break-word",
            }}
          >
            <span>Our RF infrastructure supports the frequency bands<br /></span>
            <span style={{ color: "#2958A4" }}>connecting</span>
            <span> enterprise, public safety, industrial, and <br />private wireless networks.</span>
          </div>
        </div>

        {/* Three columns of band cards */}
        <div className="w-full flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8">
          {BANDS.map((column, colIndex) => (
            <div
              key={colIndex}
              className="flex flex-col justify-start items-start gap-[50px] w-full lg:flex-1 lg:max-w-[320px]"
            >
              {column.map((band, bandIndex) => (
                <div
                  key={bandIndex}
                  className="flex flex-col justify-start items-start gap-[50px] w-full max-w-[320px]"
                >
                  <div className="flex flex-col justify-start items-start gap-2.5">
                    <div
                      className="text-[#457B9D] font-normal leading-[34px] break-words max-w-[280px]"
                      style={{
                        fontSize: "clamp(22px, 3vw, 28px)",
                        fontFamily: "Satoshi, sans-serif",
                      }}
                    >
                      {band.title}
                    </div>
                    <div
                      className="text-black font-normal text-lg leading-[34px] break-words max-w-[280px]"
                      style={sectionStyles}
                    >
                      {band.frequency}
                    </div>
                  </div>
                  <div
                    className="w-full max-w-[320px] text-black font-normal text-base leading-[26px] break-words"
                    style={sectionStyles}
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
  );
}
