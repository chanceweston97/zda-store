import Link from 'next/link'

const hours = [
  {
    id: 1,
    label: 'Mon - Fri : 8:30AM - 5:00PM',
    href: '#',
  }
]

export default function Info() {
  return (
    <div className="w-full sm:w-auto">
      <h2 className="mb-7.5 text-custom-1 font-medium text-white">
        Hours
      </h2>

      <ul className="flex flex-col gap-3">
        {
          hours.map((link) => (
            <li key={link.id}>
              <Link
                className="ease-out duration-200 hover:text-white text-white/60"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}

      </ul>

      <h2 className="mb-7.5 text-custom-1 font-medium text-white mt-7.5">
        Address
      </h2>

      <ul className="flex flex-col gap-3">
        <li>
          <Link
            className="ease-out duration-200 hover:text-white text-white/60"
            href="#"
          >
            3040 McNaughton Dr. Ste. A<br />
            Columbia, SC 29223
          </Link>
        </li>
        <li>
          <Link
            className="ease-out duration-200 hover:text-white text-white/60"
            href="mailto:sales@zdacomm.com"
          >
            sales@zdacomm.com
          </Link>
        </li>
        <li>
          <Link
            className="ease-out duration-200 hover:text-white text-white/60"
            href="tel:18034194702"
          >
            +1 (803) 419-4702
          </Link>
        </li>
      </ul>
    </div>
  )
}
