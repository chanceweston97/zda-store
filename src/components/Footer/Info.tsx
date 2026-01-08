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
        HOURS
      </h2>

      <ul className="flex flex-col gap-3">
        {
          hours.map((link) => (
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

      <h2 
        className="mb-7.5 mt-7.5"
        style={{
          color: '#70C8FF',
          fontFamily: 'Satoshi, sans-serif',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '30px'
        }}
      >
        ADDRESS
      </h2>

      <ul className="flex flex-col gap-3">
        <li>
          <Link
            className="ease-out duration-200 hover:text-[#70C8FF]"
            href="#"
            style={{ color: '#fff' }}
          >
            3040 McNaughton Dr. Ste. A<br />
            Columbia, SC 29223
          </Link>
        </li>
        <li>
          <Link
            className="ease-out duration-200 hover:text-[#70C8FF]"
            href="mailto:sales@zdacomm.com"
            style={{ color: '#fff' }}
          >
            sales@zdacomm.com
          </Link>
        </li>
        <li>
          <Link
            className="ease-out duration-200 hover:text-[#70C8FF]"
            href="tel:18034194702"
            style={{ color: '#fff' }}
          >
            +1 (803) 419-4702
          </Link>
        </li>
      </ul>
    </div>
  )
}
