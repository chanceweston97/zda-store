
export default function WishListTableHeader() {
  return (
    <div className="flex items-center py-5.5 px-10">
      <div className="min-w-[83px]"></div>
      <div className="min-w-[387px]">
        <p className="text-dark">Product</p>
      </div>

      <div className="min-w-[205px]">
        <p className="text-dark">Unit Price</p>
      </div>

      <div className="min-w-[265px]">
        <p className="text-dark">Stock Status</p>
      </div>

      <div className="min-w-[150px]">
        <p className="text-dark text-right">Action</p>
      </div>
    </div>
  )
}
