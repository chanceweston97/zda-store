import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";
import FooterSocials from "./FooterSocials";

const aboutData = [
  {
    id: 1,
    icon: MapIcon,
    text: "685 Market Street,Las Vegas, LA 95820,United States.",
  },
  {
    id: 2,
    icon: CallIcon,
    text: "(+099) 532-786-9843",
  },
  {
    id: 3,
    icon: EmailIcon,
    text: "support@example.com",
  },
];

export default function FooterAbout() {
  return (
    <div className="max-w-[330px] w-full">
      <h2 className="mb-7.5 text-custom-1 font-medium text-dark">
        Help & Support
      </h2>

      <ul className="flex flex-col gap-3">
        {aboutData.map((item) => (
          <li key={item.id} className="flex gap-4.5">
            <span className="w-6 h-6 shrink-0 text-[#2958A4]">
              <item.icon className="w-6 h-6 text-[#2958A4]" />
            </span>
            {item.text}
          </li>
        ))}
      </ul>

      <FooterSocials />
    </div>
  );
}
