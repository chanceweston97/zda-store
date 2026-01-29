import { Metadata } from "next";
import LegalHero from "@/components/Common/LegalHero";

export const metadata: Metadata = {
  title: "Return Policy | ZDA Communications",
  description: "Return policy for ZDA Communications",
};

const ReturnPolicyPage = () => {
  return (
    <main>
      <LegalHero
        title="Return Policy"
        effectiveDate="January 16, 2026"
      />
      <section className="bg-white">
        <div
          className="mx-auto w-full max-w-[1340px] px-4 sm:px-6 lg:px-0 py-12 text-black"
          style={{
            fontFamily: "Satoshi, sans-serif",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            width: "1340px",
            maxWidth: "100%",
          }}
        >
          <div className="space-y-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
            <p>
              ZDA Communications (<span className="font-medium">"ZDA,"</span> "we," "us," or "our") is committed to
              customer satisfaction. This Return Policy ("<span className="font-medium">Policy</span>") describes the
              terms and conditions under which you may return products purchased
              from ZDA or through our website located at{" "}
              <span className="underline">www.zdacomm.com</span> (the "<span className="font-medium">Website</span>").
            </p>
            <p>
              This Policy applies to products purchased directly from ZDA. For
              products purchased through resellers or other third parties,
              please refer to that seller's return policy. By placing an order
              with ZDA, you acknowledge that you have read, understood, and
              agree to this Return Policy.
            </p>
          </div>

          <div className="mt-[25px] space-y-[25px]">
            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                1. Return Eligibility
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Returns may be accepted for products that are unused, in
                original packaging, and in resalable condition. Custom-built or
                specially ordered items may not be eligible for return unless
                otherwise agreed in writing. Products that have been installed,
                modified, or used may not be returned except as required by law
                or as determined by ZDA in its sole discretion.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                2. Return Timeframe
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                You must request a return within 30 days of the date of
                delivery. Return requests received after this period may be
                denied. ZDA reserves the right to modify this timeframe for
                specific product categories or promotions.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                3. Return Authorization
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Before returning any product, you must obtain a Return
                Merchandise Authorization (RMA) number from ZDA. To request an
                RMA, contact us at <span className="underline">sales@zdacomm.com</span> or{" "}
                <span className="underline">+1 (803) 419-4702</span> with your
                order number, product details, and reason for return. Returns
                shipped without a valid RMA may be refused or delayed.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                4. Shipping and Handling
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                You are responsible for the cost of shipping the product back
                to ZDA unless the return is due to our error or a defective
                product. Products must be packed securely to prevent damage in
                transit. ZDA is not responsible for items lost or damaged
                during return shipment. We recommend using a trackable shipping
                method.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                5. Refunds
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Once we receive and inspect your return, we will notify you of
                the approval or rejection of your refund. If approved, refunds
                will be processed to the original method of payment within a
                reasonable period. Refunds may exclude original shipping
                charges unless the return is due to our error. Allow additional
                time for your bank or card company to process the refund.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                6. Defective or Incorrect Products
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                If you receive a defective product or an item that does not
                match your order, please contact us immediately. We will work
                with you to arrange a replacement or full refund, including
                shipping costs where applicable. Documentation or photos of
                the defect or error may be required.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                7. Exchanges
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Exchanges for a different product or configuration may be
                available subject to the same eligibility and RMA process.
                Contact our sales team to discuss exchange options.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                8. Restocking Fees
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                ZDA may apply a restocking fee for certain returns, as
                communicated at the time of the return authorization. No
                restocking fee will apply to returns due to defect or our
                error.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                9. Changes to This Policy
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We may update this Return Policy from time to time. Any
                changes will be posted on this page with an updated effective
                date. Your continued use of the Website or purchases from ZDA
                after changes are posted constitutes your acceptance of the
                revised Policy.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                10. Contact Us
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                If you have questions about returns or this Return Policy,
                please contact:
              </p>
              <p className="mt-[15px] text-[16px] leading-[150%] tracking-[-0.32px]">
                ZDA Communications
                <br />
                Email: <span className="underline">sales@zdacomm.com</span>
                <br />
                Phone: +1 (803) 419-4702
                <br />
                Address: 3040 McNaughton Dr Ste. A, Columbia, SC 29223
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReturnPolicyPage;
