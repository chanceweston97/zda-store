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
                className="ease-out duration-200 hover:text-[#70C8FF]"
                href={link.href}
                style={{ color: '#fff' }}
              >
                {link.label}
              </Link>
            </li>
          ))}

      </ul>
    </div>
  )
}
