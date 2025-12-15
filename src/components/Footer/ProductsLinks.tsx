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
    label: 'Cable Customizer',
    href: '/cable-customizer',
  },
  {
    id: 4,
    label: 'Connectors',
    href: '/connectors',
  },
  {
    id: 5,
    label: 'All',
    href: '/shop-with-wide-sidebar',
  }
]
export default function ProductsLinks() {
  return (
    <div className="w-full sm:w-auto">
      <h2 className="mb-7.5 text-custom-1 font-medium text-white">
        Products
      </h2>

      <ul className="flex flex-col gap-3.5">
        {
          accountLinks.map((link) => (
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

