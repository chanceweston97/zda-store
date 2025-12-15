import { getProductsByFilter } from "@/lib/data/shop-utils";
import { Product } from "@/types/product";
import { unstable_cache as cache } from "next/cache";
import Link from "next/link";
import BestSellerSectionTitle from "./BestSellerSectionTitle";
import SingleItem from "./SingleItem";

const getBestSeller = cache(
  async () => {
    // Get best seller products (first 6 products)
    const products = await getProductsByFilter(
      '*[_type == "product"][0...6]',
      ["product"]
    );
    return products as Product[];
  },
  ["best-seller"],
  {
    tags: ["product"],
  }
);

const BestSeller = async () => {
  const products = await getBestSeller();

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1340px] w-full mx-auto px-4 sm:px-6 xl:px-0 ">
        <BestSellerSectionTitle />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {products.map((product) => (
            <SingleItem item={product} key={product._id} />
          ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-full border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
