import Link from 'next/link'

const quickLinks = [
  {
    id: 1,
    label: 'Contact Us',
    href: '/contact',
  },
  {
    id: 2,
    label: 'Request a Quote',
    href: 'request-a-quote',
  },
  {
    id: 3,
    label: 'Returns',
    href: '#',
  },
  {
    id: 4,
    label: "FAQ's",
    href: '#',
  },
]

export default function QuickLinks() {
  return (
    <div className="w-full sm:w-auto">
      <h2 
        className="mb-7.5"
        style={{
          color: '#70C8FF',
          fontFamily: 'Satoshi, sans-serif',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '30px'
        }}
      >
        CONNECT
      </h2>

      <ul className="flex flex-col gap-3">
        {
          quickLinks.map((link) => (
            <li key={link.id}>
              <Link
                className="text-white ease-out duration-200 hover:text-[#70C8FF]"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}

      </ul>
    </div>
  )
}
