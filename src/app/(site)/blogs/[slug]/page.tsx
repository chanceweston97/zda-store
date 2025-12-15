import { notFound } from 'next/navigation';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params) {
  return {
    title: 'Blog Not Found',
    description: 'Blog functionality has been removed',
  };
}

const BlogDetailsPage = async ({ params }: Params) => {
  notFound();
};

export default BlogDetailsPage;
