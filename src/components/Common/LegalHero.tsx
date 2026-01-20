type LegalHeroProps = {
  title: string;
  effectiveDate: string;
};

const LegalHero = ({ title, effectiveDate }: LegalHeroProps) => {
  return (
    <section className="w-full bg-[#F5F8FE] mt-[80px]">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-0 pt-[70px] pb-[60px]">
        <h1
          className="w-full max-w-[1240px] shrink-0 text-black font-normal text-[32px] leading-[40px] sm:text-[40px] sm:leading-[50px] lg:text-[50px] lg:leading-[60px] tracking-[-2px]"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          {title}
        </h1>
        <p
          className="mt-[25px] w-full max-w-[1240px] shrink-0 text-black font-normal text-[16px] leading-[24px] sm:text-[18px] sm:leading-[26px]"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          Effective Date: {effectiveDate}
        </p>
      </div>
    </section>
  );
};

export default LegalHero;
