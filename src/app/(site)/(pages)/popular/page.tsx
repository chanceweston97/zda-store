import Breadcrumb from '@/components/Common/Breadcrumb';
import ShopWithoutSidebar from '@/components/ShopWithoutSidebar';
import { getProductsByFilter } from "@/lib/data/shop-utils";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Page | ZDA Communications',
  description: 'This is Shop Page for ZDAComm Template',
  // other metadata
};

type PageProps = {
  searchParams: Promise<{
    sort: string;
  }>;
};

const ShopWithoutSidebarPage = async ({ searchParams }: PageProps) => {
  const { sort } = await searchParams;

  let sortQuery = '| order(length(reviews) desc)';

  if (sort === 'latest') {
    sortQuery = '| order(publishedAt desc)';
  }

  const query = `*[_type == "product"] ${sortQuery}`;
  const data = await getProductsByFilter(query, ['product']);

  return (
    <main>
      <Breadcrumb
        title={'Our Best Products'}
        pages={['shop', '/', 'popular']}
      />
      <ShopWithoutSidebar key={sort} shopData={data} />
    </main>
  );
};

export default ShopWithoutSidebarPage;
