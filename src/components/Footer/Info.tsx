import Link from 'next/link'

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
          fontWeight: 400,
          lineHeight: '30px'
        }}
      >
        CONTACT
      </h2>

      <ul className="flex flex-col gap-2.5">
        <li>
          <Link
            className="ease-out duration-200 hover:text-[#70C8FF]"
            href="mailto:sales@zdacomm.com"
            style={{
              color: '#fff',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '28px'
            }}
          >
            sales@zdacomm.com
          </Link>
        </li>
        <li>
          <Link
            className="ease-out duration-200 hover:text-[#70C8FF]"
            href="tel:18034194702"
            style={{
              color: '#fff',
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: '28px'
            }}
          >
            +1 (803) 419-4702
          </Link>
        </li>
      </ul>
    </div>
  )
}
