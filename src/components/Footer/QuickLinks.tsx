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
      <h2 className="mb-7.5 text-custom-1 font-medium text-white">
        Get Help
      </h2>

      <ul className="flex flex-col gap-3">
        {
          quickLinks.map((link) => (
            <li key={link.id}>
              <Link
                className="ease-out duration-200 hover:text-white"
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
