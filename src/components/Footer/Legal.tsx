import Link from "next/link";

const legalLinks = [
  { id: 1, label: "Terms of Sale", href: "/terms-of-sale" },
  { id: 2, label: "Terms and Conditions", href: "/terms-and-conditions" },
  { id: 3, label: "Privacy Policy", href: "/privacy-policy" },
];

export default function Legal() {
  return (
    <div className="w-full sm:w-auto">
      <h2
        className="mb-7.5"
        style={{
          color: "#70C8FF",
          fontFamily: "Satoshi, sans-serif",
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "30px",
        }}
      >
        LEGAL
      </h2>

      <ul className="flex flex-col gap-2.5">
        {legalLinks.map((link) => (
          <li key={link.id}>
            <Link
              className="text-white ease-out duration-200 hover:text-[#70C8FF]"
              href={link.href}
              style={{
                fontFamily: "Satoshi, sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                lineHeight: "28px",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
