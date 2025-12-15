import ProductItem from "@/components/Common/ProductItem";
import { getProductsByFilter } from "@/lib/data/shop-utils";
import NewArrivalTitle from "./NewArrivalTitle";

const NewArrival = async () => {
  const products = await getProductsByFilter(
    `*[_type == "product"] | order(publishedAt desc)[0...8]`,
    ["product"]
  );

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 xl:px-0 ">
        <NewArrivalTitle />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {products.map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
