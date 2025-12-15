import Link from 'next/link'

const quickLinks = [
  {
    id: 1,
    label: 'Privacy Policy',
    href: '/privacy-policy',
  },
  {
    id: 2,
    label: 'Terms & Conditions',
    href: 'terms-and-conditions',
  },
  {
    id: 3,
    label: 'Site Map',
    href: 'site-map',
  },
]

export default function Legal() {
  return (
    <div className="w-full sm:w-auto">
      <h2 className="mb-7.5 text-custom-1 font-medium text-white">
        Legal
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
