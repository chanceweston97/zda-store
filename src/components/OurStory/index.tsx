import ProudPartners from "../Home/Hero/ProudPartners";
import WorkWithUsSection from "./WorkWithUs";
import FaqSection from "../Home/Faq";
import Newsletter from "../Common/Newsletter";
import { AnimatedHeroSection, AnimatedWhatWeFocusOn, AnimatedLetsWorkTogether } from "./AnimatedSections";

export default function OurStory() {
  // Default data - can be replaced with CMS data later
  const heroData = {
    title: "Our Story",
    description: "Since 2008, we've focused on designing and supplying RF hardware—antennas, cables, connectors, attenuators, and custom builds—that helps homes, organizations, and field teams stay in touch when it matters most.",
  };

  const focusData = {
    title: "What We Focus On",
    introText: "We don't try to be everything to everyone. We focus on the RF path:",
    items: [
      { title: "Antennas", description: "Directional and omni RF antennas for reliable, real-world coverage." },
      { title: "Cables", description: "Low-loss coaxial cable assemblies built to your spec, assembled in the United States." },
      { title: "Connectors, Adapters, RF Accessories", description: "Industrial-grade RF connectors, adapters and supporting components for secure, low-VSWR joins, and easy installation" },
      { title: "Attenuators & RF Accessories", description: "Supporting components that help protect equipment, fine-tune systems, and make installations easier." },
      { title: "Custom Cable Builds", description: "Practical, build-to-order cable solutions so you can get the exact lengths and terminations you need for your real-world deployment." },
    ],
    closingText: "Every product we offer is ultimately in service of the same idea: make it easier to build links that stay up.",
    image: "/images/hero/wireless.png",
  };

  const workData = {
    title: "Let's Work Together",
    introText: "Over the years, ZDA Communications has supported a wide range of people and teams who all share the same need: reliable connectivity.",
    subtitle: "That includes:",
    items: [
      "Municipal and government organizations",
      "Utilities, SCADA, and industrial control networks",
      "Wireless ISPs and fixed wireless operators",
      "Integrators and installation teams",
      "Enterprises, campuses, and facilities",
      "Radio enthusiasts, hobbyists, and small project builders",
    ],
    closingText: "Whether you're maintaining a mission-critical network or setting up a single link at a remote site, we want to make the RF side of your job simpler and more dependable.",
    buttons: [
      { text: "Explore Products", link: "/store" },
      { text: "Contact Us", link: "/contact" },
    ],
    image: "/images/hero/wireless.png",
  };

  return (
    <main className="overflow-hidden">
      {/* Our Story Section */}
      <AnimatedHeroSection heroData={heroData} />

      {/* What We Focus On Section */}
      <AnimatedWhatWeFocusOn focusData={focusData} />

      {/* Let's Work Together Section */}
      <AnimatedLetsWorkTogether workData={workData} />

      {/* Proud Partners Section */}
      <ProudPartners partnersData={null} />

      {/* Work With Us Section */}
      <WorkWithUsSection />

      {/* FAQ Section */}
      <FaqSection faqData={null} />

      {/* Newsletter Section */}
      <Newsletter />
    </main>
  );
}

