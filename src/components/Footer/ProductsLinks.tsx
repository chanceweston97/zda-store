import Link from 'next/link'

const accountLinks = [
  {
    id: 1,
    label: 'Antennas',
    href: '/categories/antennas',
  },
  {
    id: 2,
    label: 'Cables',
    href: '/categories/cables',
  },
  {
    id: 3,
    label: 'Cable Builder',
    href: '/cable-builder',
  },
  {
    id: 4,
    label: 'Connectors',
    href: '/categories/connectors',
  },
  {
    id: 5,
    label: 'All',
    href: '/products',
  }
]
export default function ProductsLinks() {
  return (
    <div className="w-full sm:w-auto">
      <h2 
        className="mb-7.5"
        style={{
          color: '#70C8FF',
          fontFamily: 'Satoshi, sans-serif',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '30px'
        }}
      >
        PRODUCTS
      </h2>

      <ul className="flex flex-col gap-2.5">
        {
          accountLinks.map((link) => (
            <li key={link.id}>
              <Link
                className="text-white ease-out duration-200 hover:text-[#70C8FF]"
                style={{
                  fontFamily: 'Satoshi, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px'
                }}
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

