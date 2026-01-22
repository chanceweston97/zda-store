import Breadcrumb from "@/components/Common/Breadcrumb";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";
import { getProductsByFilter } from "@/lib/data/shop-utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | ZDA Communications",
  description: "Browse our products at ZDA Communications",
  // other metadata
};

type PageProps = {
  searchParams: Promise<{
    sort: string;
  }>;
};

const ShopWithoutSidebarPage = async ({ searchParams }: PageProps) => {
  const { sort } = await searchParams;

  let sortQuery = "| order(publishedAt desc)";

  if (sort === "popular") {
    sortQuery = "| order(length(reviews) desc)";
  }

  const query = `*[_type == "product"] ${sortQuery}`;

  const data = await getProductsByFilter(query, ["product"]);

  return (
    <main>
      <Breadcrumb
        title={"Explore All Products"}
        pages={["products", "/", "products"]}
      />
      <ShopWithoutSidebar key={sort} shopData={data} />
    </main>
  );
};

export default ShopWithoutSidebarPage;
