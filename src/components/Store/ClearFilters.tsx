"use client"

import { usePathname, useRouter } from "next/navigation"

export default function ClearFilters() {
  const router = useRouter()
  const pathname = usePathname() || ""

  function handleClear() {
    router.replace(pathname, { scroll: false })
  }

  return (
    <div className="px-5 py-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[#2958A4] font-medium">Filters:</p>
        <button
          className="text-[#2958A4] hover:text-[#2958A4]/80 transition-colors"
          onClick={handleClear}
        >
          Clean All
        </button>
      </div>
    </div>
  )
}

