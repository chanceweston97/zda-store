import type { WishlistItem } from "@/types/wishlistItem";
import SingleItem from "./SingleItem";

export default function WishListTable({
  wishlistItems,
}: {
  wishlistItems: WishlistItem[];
}) {
  return (
    <div className="bg-white rounded-lg shadow-1 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-1 border-b border-gray-3">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark w-12 whitespace-nowrap">
                {/* Remove column */}
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark min-w-[300px] whitespace-nowrap">
                Product
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark min-w-[120px] whitespace-nowrap">
                Unit Price
              </th>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark min-w-[120px] whitespace-nowrap">
                Stock Status
              </th>
              <th className="text-right py-4 px-6 text-sm font-medium text-dark min-w-[140px] whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3">
            {wishlistItems.map((item, i) => (
              <SingleItem item={item} key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
