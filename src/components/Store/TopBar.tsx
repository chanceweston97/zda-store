type TopBarProps = {
  allProductsCount: number
  showingProductsCount: number
}

export default function TopBar({ allProductsCount, showingProductsCount }: TopBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <p className="text-[#2958A4] text-sm">
        Showing{" "}
        <span className="text-[#4F6866] font-medium">
          {showingProductsCount} of {allProductsCount}
        </span>{" "}
        Products
      </p>
    </div>
  )
}

