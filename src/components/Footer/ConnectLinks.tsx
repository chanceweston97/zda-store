import Link from "next/link";

const resourceLinks = [
  { id: 1, label: "Company", href: "/company" },
  { id: 2, label: "Contact", href: "/contact" },
  { id: 3, label: "Catalog", href: "/catalog" },
  { id: 4, label: "Solutions", href: "/solutions" },
];

export default function ConnectLinks() {
  return (
    <div className="w-full sm:w-auto">
      <h2
        className="mb-7.5"
        style={{
          color: "#FFFFFF",
          fontFamily: "Satoshi, sans-serif",
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "30px",
        }}
      >
        RESOURCES
      </h2>
      <ul className="flex flex-col gap-2.5">
        {resourceLinks.map((link) => (
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
  );
}
