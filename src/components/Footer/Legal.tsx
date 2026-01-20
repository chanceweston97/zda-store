import Link from 'next/link'

const quickLinks = [
  {
    id: 1,
    label: 'Catalog',
    href: '/catalog',
  },
  {
    id: 2,
    label: 'Privacy Policy',
    href: '/privacy-policy',
  },
  {
    id: 3,
    label: 'Terms & Conditions',
    href: '/terms-and-conditions',
  },
]

export default function Legal() {
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
        RESOURCES
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
