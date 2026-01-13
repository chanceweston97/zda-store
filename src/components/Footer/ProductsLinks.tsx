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
    href: '/cable-customizer',
  },
  {
    id: 4,
    label: 'Connectors',
    href: '/categories/connectors',
  },
  {
    id: 5,
    label: 'All',
    href: '/shop',
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
          fontWeight: 500,
          lineHeight: '30px'
        }}
      >
        PRODUCTS
      </h2>

      <ul className="flex flex-col gap-3.5">
        {
          accountLinks.map((link) => (
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

