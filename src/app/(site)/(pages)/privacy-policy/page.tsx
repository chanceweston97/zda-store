import { Metadata } from "next";
import LegalHero from "@/components/Common/LegalHero";

export const metadata: Metadata = {
  title: "Privacy Policy | ZDA Communications",
  description: "Privacy policy for ZDA Communications",
};

const PrivacyPolicyPage = () => {
  return (
    <main>
      <LegalHero title="Privacy Policy" effectiveDate="January 16, 2026" />
      <section className="bg-white">
        <div
          className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-0 py-12 text-black"
          style={{
            fontFamily: "Satoshi, sans-serif",
            display: "flex",
            width: "1340px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            maxWidth: "100%",
          }}
        >
          <div className="w-[1340px] justify-start text-[16px] leading-[24px]">
            <p>
              ZDA Communications ("<span className="font-medium">ZDA</span>", "<span className="font-medium">we</span>", "<span className="font-medium">us</span>", or "<span className="font-medium">our</span>") is committed to responsibly handling personal information that we collect or otherwise process regarding individuals who visit our website located at <span className="underline">www.zdacomm.com</span> (the "<span className="font-medium">Website</span>") or otherwise communicate or engage with us ("<span className="font-medium">you</span>" or "<span className="font-medium">your</span>"). This Privacy Policy ("<span className="font-medium">Policy</span>") explains how we collect, use, disclose, transfer, retain, and protect personal information and certain rights you may have with respect to such personal information.
              <br /><br />
              Your access to and use of the Website and your communications or engagements with ZDA are subject to this Policy. By visiting the Website, submitting information to us, or otherwise interacting with us, you consent to our collection, use, disclosure, and other processing of your personal information in accordance with this Policy. If you do not agree with this Policy, you should discontinue use of the Website and cease submitting personal information to us.
            </p>
          </div>

          <div className="mt-[25px] space-y-[25px]">
            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                1. Collection of Personal Information
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We collect certain personal information that you voluntarily
                provide when you interact with us or when it is necessary to
                operate the Website or perform our business functions. This
                information may include, but is not limited to:
              </p>
              <ul className="mt-[25px] list-disc pl-5 space-y-2 text-[16px] leading-[150%] tracking-[-0.32px]">
                <li>
                  Contact information such as name, business name, email
                  address, phone number, and mailing address.
                </li>
                <li>
                  Company information and role, including your organization’s
                  name and your title.
                </li>
                <li>
                  Communications you send to us, such as inquiries or requests
                  for information.
                </li>
                <li>
                  Technical information from your device or browser, including
                  IP address, browser type, operating system, and browsing
                  behavior via cookies and similar technologies.
                </li>
              </ul>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We may also collect information automatically generated about
                your visit to the Website, including clickstream data, pages
                viewed, session duration, and related analytics information.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                2. Use of Personal Information
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We use the personal information we collect for legitimate
                business purposes, including but not limited to:
              </p>
              <ul className="mt-[25px] list-disc pl-5 space-y-2 text-[16px] leading-[150%] tracking-[-0.32px]">
                <li>Operating and improving the Website and our services.</li>
                <li>
                  Responding to your inquiries and fulfilling your requests.
                </li>
                <li>
                  Providing products, information, and updates that you
                  request.
                </li>
                <li>Analyzing Website usage to improve your experience.</li>
                <li>
                  Administering our business operations, record keeping, and
                  security.
                </li>
                <li>Complying with legal and regulatory requirements.</li>
              </ul>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We may also use your contact information to send you marketing
                communications about our products and services, unless you
                instruct us not to do so.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                3. Disclosure of Personal Information
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We will not sell your personal information. We may share
                personal information with:
              </p>
              <ul className="mt-[25px] list-disc pl-5 space-y-2 text-[16px] leading-[150%] tracking-[-0.32px]">
                <li>
                  Service providers that assist with Website operations, IT
                  services, analytics, and customer support.
                </li>
                <li>
                  Legal authorities, regulators, or other third parties when
                  required by applicable law.
                </li>
                <li>
                  Affiliates and partners in connection with corporate
                  transactions such as mergers or acquisitions.
                </li>
                <li>
                  Other third parties where you have provided consent.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                4. Data Retention
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We retain personal information only as long as necessary to
                fulfill the purposes for which it was collected, to meet legal
                and regulatory obligations, and to enforce our legal rights.
                Factors influencing retention include applicable statutes of
                limitation and business needs.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                5. Data Security
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We implement administrative, physical, and technical safeguards
                designed to protect personal information from unauthorized
                access, use, or disclosure. However, no security measure is
                completely secure, and we cannot guarantee absolute protection.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                6. Cookies and Similar Technologies
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We and our service providers (e.g., analytics providers) may use
                cookies and similar tracking technologies to improve your
                experience on the Website and to collect technical and usage
                data. Cookies may be session-based or persistent, and you may
                adjust your browser settings to manage or block cookies.
                However, blocking cookies may impact certain Website
                functionality.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                7. Third-Party Links
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                The Website may contain links to third-party websites over which
                ZDA has no control. We are not responsible for the privacy
                practices or content of such sites, and you should review the
                privacy policies of any sites you visit.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                8. Your Rights
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Depending on your location and applicable law, you may have
                rights regarding your personal information, including the right
                to request access, correction, deletion, or to object to certain
                processing. To exercise your rights, please contact us at the
                contact information below.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                9. Children's Privacy
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                The Website is not intended for individuals under the age of 13,
                and we do not knowingly collect personal information from
                children.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                10. Changes to this Policy
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                We may update this Policy from time to time. Any changes will be
                posted on this page with an updated effective date. Your
                continued use of the Website after changes are posted
                constitutes your acceptance of the revised Policy.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                11. Contact Us
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                If you have questions or concerns about this Privacy Policy or
                our data practices, please contact:
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                ZDA Communications
                <br />
                Email: <span className="underline">legal@zdacomm.com</span>
                <br />
                Address: 3040 McNaughton Dr. Ste. A, Columbia, SC 29223
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PrivacyPolicyPage;
