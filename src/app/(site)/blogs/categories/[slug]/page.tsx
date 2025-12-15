import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return [];
}

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const BlogCategoryPage = async ({ params }: PageProps) => {
  notFound();
};

export default BlogCategoryPage;
