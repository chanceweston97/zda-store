// FAQ Data
// Edit this file to update FAQ items

import { FAQ } from "../types";

export const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "What does ZDA Communications specialize in?",
    answer: "We design and supply industrial-grade antennas, coaxial cables, and RF accessories engineered for reliable performance in demanding environments.",
    order: 1,
  },
  {
    id: "faq-2",
    question: "Which applications are your antennas designed for?",
    answer: "Our antennas support fixed wireless, SCADA, utility monitoring, transportation, public safety, and other mission-critical wireless applications.",
    order: 2,
  },
  {
    id: "faq-3",
    question: "Do your antennas work with third-party equipment?",
    answer: "Yes. Our products are 50-ohm and interface with common radios, modems, hotspots, routers, and signal boosters from major manufacturers, using standard RF connectors.",
    order: 3,
  },
  {
    id: "faq-4",
    question: "What connector types are available?",
    answer: "N-Female is the standard connector for most of our antennas. We also support SMA, RP-SMA, N-Male, TNC, and other terminations on request.",
    order: 4,
  },
  {
    id: "faq-5",
    question: "What is antenna gain and why does it matter?",
    answer: "Gain (dBi) indicates how effectively an antenna focuses energy. Higher gain narrows the beam to improve signal at the point of capture or coverage, useful for long or noisy links.",
    order: 5,
  },
  {
    id: "faq-6",
    question: "What is VSWR and what are your typical values?",
    answer: "VSWR measures impedance match quality. Lower is better. Our antennas are QC-verified to meet ≤ 1.5:1 typical, reducing return loss and protecting connected radios.",
    order: 6,
  },
];

export default faqs;


