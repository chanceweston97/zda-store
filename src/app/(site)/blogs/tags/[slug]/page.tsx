import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const BlogGrid = async ({ params }: Props) => {
  notFound();
};

export default BlogGrid;
