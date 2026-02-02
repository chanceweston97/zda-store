import { Metadata } from "next";
import LegalHero from "@/components/Common/LegalHero";

export const metadata: Metadata = {
  title: "Terms and Conditions of Use | ZDA Communications",
  description: "Terms and conditions of use for ZDA Communications",
};

const TermsAndConditionsPage = () => {
  return (
    <main>
      <LegalHero
        title="Terms and Conditions of Use"
        effectiveDate="January 16, 2026"
      />
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
          <div className="space-y-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
            <p>
              These Terms and Conditions of Use (the <span className="font-medium">"Terms"</span>) constitute a legal
              agreement between you (<span className="font-medium">"you"</span> or <span className="font-medium">"your"</span>) and ZDA Communications
              (<span className="font-medium">"ZDA,"</span> "we," "us," or "our") and govern your access to and use of
              the ZDA Communications website located at{" "}
              <span className="underline">www.zdacomm.com</span> (the <span className="font-medium">"Site"</span>),
              including all content, materials, documents, and information made
              available through the Site (collectively, the <span className="font-medium">"Content"</span>).
            </p>
            <p>
              These Terms apply only to your use of the Site and Content. They
              do not apply to the purchase of products or services from ZDA,
              which are governed by applicable quotations, purchase agreements,
              invoices, reseller agreements, or other written contracts entered
              into between you and ZDA.
            </p>
            <p className="font-medium">
              By accessing or using the Site, you acknowledge that you have
              read, understood, and agree to be bound by these Terms. If you do
              not agree, you may not access or use the Site.
            </p>
          </div>

          <div className="mt-[25px] space-y-[25px]">
            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                1. Privacy
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Your use of the Site is subject to ZDA Communications' Privacy
                Policy, which describes how we collect, use, and protect
                personal information submitted through the Site.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                2. Access and Use of the Site
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Subject to your compliance with these Terms, ZDA grants you a
                limited, revocable, non-exclusive, non-transferable license to
                access and use the Site and Content <span className="font-medium">solely for informational and
                non-commercial purposes.</span>
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                ZDA may modify, suspend, or discontinue the Site or any Content
                at any time without notice. ZDA shall not be liable for any such
                modification, suspension, or discontinuance.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                3. Prohibited Uses
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                As a condition of your use of the Site and Content, you warrant
                to ZDA that you will not use the Site and/or Content for any
                purpose that is unlawful or prohibited by these Terms.
                Specifically, you are not allowed to (directly or indirectly):
                (i) resell, license, or otherwise make commercial use of the
                Site and/or Content; (ii) collect, reproduce, or use any images,
                product descriptions, specifications, datasheets, documentation,
                or other content included in the Site and/or Content, or any
                portion thereof, without prior written authorization; (iii) copy,
                imitate, distribute, publicly perform, or publicly display the
                Site and/or Content; (iv) modify or otherwise create derivative
                works of the Site and/or Content, or any portion thereof; (v) use
                data mining, robots, scraping tools, or similar data gathering or
                extraction methods on the Site; (vi) perform, publish, release,
                or disclose the results of any benchmarking, penetration testing,
                or vulnerability assessments of the Site; (vii) introduce into
                the Site any viruses, trojan horses, malware, spyware, adware, or
                other malicious or disruptive software, or any software code
                designed to disrupt, damage, interfere with, or perform
                unauthorized actions on any computer system or network; (viii)
                remove, obscure, or alter any proprietary notices, labels,
                trademarks, or copyright notices on or in the Site and/or
                Content; (ix) use the Site and/or Content to directly or
                indirectly develop, design, or provide any product or service
                that competes with the Site or ZDA's offerings; (x) download
                (other than standard page caching) any portion of the Site and/or
                Content or any information contained therein, except as expressly
                permitted through the Site; or (xi) use the Site and/or Content
                in any manner not expressly authorized by these Terms.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                You may not use the Site and/or Content in any manner that
                violates any applicable laws, statutes, rules, or regulations, or
                in any manner that could damage, disable, overburden, impair, or
                interfere with the proper functioning of the Site or any other
                party's access to or use and enjoyment of the Site and/or
                Content. You may not obtain or attempt to obtain any materials or
                information through any means not intentionally made available or
                provided through the Site, including, without limitation, through
                the use of data mining, automated tools, robots, or similar data
                gathering or extraction methods.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                4. Intellectual Property Rights
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                All Content on the Site, including text, graphics, images,
                specifications, datasheets, logos, trademarks, and software, is
                owned by or licensed to ZDA Communications and is protected by
                U.S. and international intellectual property laws.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Nothing in these Terms grants you any ownership rights or license
                to use ZDA trademarks, logos, or proprietary materials without
                prior written consent. All rights not expressly granted are
                reserved by ZDA.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                5. Copyright and Trademark Complaints
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                If you believe that content on the Site infringes your copyright
                or trademark rights, please contact us with sufficient detail to
                investigate the claim.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                6. Feedback
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Any suggestions, comments, or feedback you submit to ZDA
                regarding the Site or Content may be used by ZDA for any
                purpose, without restriction or compensation.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                7. Termination
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                ZDA reserves the right, at its sole discretion, to suspend or
                terminate your access to the Site or Content at any time and for
                any reason, without notice.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                8. Third-Party Links
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                The Site may contain links to third-party websites. ZDA does not
                control or endorse such sites and is not responsible for their
                content, policies, or practices. Your use of third-party sites is
                at your own risk.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                9. Availability and International Use
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                The Site is intended for use within the United States. ZDA makes
                no representation that the Site or Content is appropriate or
                available outside the U.S. You are responsible for compliance
                with local laws if you access the Site from another
                jurisdiction.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                10. Disclaimer
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px] uppercase">
                THE SITE AND CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE." ZDA
                DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                ACCURACY, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px] uppercase">
                ZDA DOES NOT WARRANT THAT THE SITE WILL BE ERROR-FREE, SECURE,
                OR UNINTERRUPTED.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                11. Limitation of Liability
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px] uppercase">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZDA SHALL NOT BE LIABLE
                FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES
                ARISING FROM OR RELATED TO YOUR USE OF THE SITE OR CONTENT.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px] uppercase">
                IN NO EVENT SHALL ZDA'S TOTAL LIABILITY EXCEED $100 USD.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                12. State-Specific Limitations
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px] uppercase">
                BECAUSE SOME STATES OR JURISDICTIONS DO NOT ALLOW THE DISCLAIMER
                OF CERTAIN WARRANTIES AND/OR THE EXCLUSION OR LIMITATION OF
                LIABILITY FOR CONSEQUENTIAL, SPECIAL, INCIDENTAL, OR OTHER
                DAMAGES, THE DISCLAIMERS AND LIMITATIONS SET FORTH IN SECTIONS 9
                AND 10 MAY NOT APPLY TO YOU. IN SUCH CASES, THE LIABILITY OF ZDA
                SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW
                IN THE RELEVANT JURISDICTION.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                13. Indemnification
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                You agree that you are solely responsible for (and that ZDA has
                no responsibility to you or to any third party for) any breach of
                your obligations under these Terms and for the consequences
                (including any loss or damage which ZDA may suffer) of any such
                breach. Except as prohibited by applicable law, you will
                indemnify, defend, and hold harmless ZDA and its officers,
                directors, employees, and agents from and against any and all
                claims, liabilities, damages, losses, costs, and expenses
                (including reasonable attorneys' fees and all related costs and
                expenses of litigation and arbitration, or at trial or on appeal,
                whether or not litigation or arbitration is instituted), whether
                arising in an action of contract, negligence, or other tortious
                action, and whether arising out of or related to (i) your access
                to or use of the Site and/or Content; and/or (ii) your violation
                of any provision of these Terms. ZDA reserves the right to assume
                control of the defense of any third-party claim that is subject
                to indemnification by you, in which event you agree to cooperate
                fully with ZDA in asserting any available defenses. This defense
                and indemnification obligation shall survive these Terms and your
                use of the Site and/or Content.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                14. Governing Law and Venue
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                These Terms shall be governed by, construed, and enforced in
                accordance with the laws of the State of South Carolina, without
                reference to its conflict or choice-of-law rules. Each party
                hereby irrevocably consents to the exclusive jurisdiction and
                venue of the federal, state, and local courts located in Richland
                County, South Carolina, in connection with any action arising out
                of or relating to these Terms. Notwithstanding the foregoing, ZDA
                may seek injunctive or other equitable relief in any court of
                competent jurisdiction, in any country, to protect its
                intellectual property or proprietary rights.
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                15. Changes to These Terms
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                ZDA reserves the right to change or modify these Terms at any
                time. If we make any such changes, we will post the updated
                Terms of Use on the Site. If we make any material changes to
                these Terms, we may notify you by posting a notice of such
                changes on the Site and/or by email if we have a valid email
                address on file. It is your responsibility to regularly review
                these Terms.{" "}
                <span className="uppercase">
                  IF ANY MODIFICATION IS UNACCEPTABLE TO YOU, YOUR SOLE REMEDY IS
                  TO CEASE USING THE SITE AND/OR CONTENT. IF YOU DO NOT CEASE
                  USING THE SITE AND/OR CONTENT FOLLOWING THE POSTING OF UPDATED
                  TERMS, YOU WILL BE DEEMED TO HAVE ACCEPTED SUCH CHANGES.
                </span>
              </p>
            </div>

            <div>
              <h2 className="text-black text-[24px] leading-[24px] font-medium tracking-[-0.48px]">
                16. General
              </h2>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Entire Agreement
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                These Terms constitute the entire agreement between you and ZDA
                and supersede all prior or contemporaneous oral or written
                agreements, understandings, or communications between you and ZDA
                with respect to the subject matter described herein. Neither the
                rights nor the obligations arising under these Terms may be
                assigned, transferred, or delegated by you without the prior
                written consent of ZDA, and any attempted assignment or transfer
                in violation of the foregoing shall be null and void and of no
                effect. The official text of these Terms (and any notice
                submitted hereunder) shall be in the English language only. The
                parties acknowledge that they require that these Terms be drawn
                up in the English language. In the event of any dispute regarding
                the construction or interpretation of these Terms, reference
                shall be made solely to these Terms as written in English and not
                to any translation thereof.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Waiver
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                You agree that if ZDA does not exercise or enforce any legal
                right or remedy contained in these Terms (or which ZDA has the
                benefit of under any applicable law), such failure shall not be
                deemed a waiver of ZDA's rights or remedies, and such rights or
                remedies shall remain available to ZDA. No waiver by either party
                of any breach of any provision of these Terms shall be deemed a
                waiver of any subsequent or prior breach of the same or any other
                provision.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Severability
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                If any court of competent jurisdiction determines that any
                provision of these Terms is invalid, unlawful, or unenforceable,
                such provision shall be severed from these Terms, and the
                remaining provisions shall continue in full force and effect.
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                Questions
              </p>
              <p className="mt-[25px] text-[16px] leading-[150%] tracking-[-0.32px]">
                If you have any questions regarding these Terms, please contact
                ZDA at <span className="underline">legal@zdacomm.com</span>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermsAndConditionsPage;
