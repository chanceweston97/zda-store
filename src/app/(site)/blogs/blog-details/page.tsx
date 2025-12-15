import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Blog Details Page | ZDAComm |  Store",
  description: "Blog functionality has been removed",
};

const BlogDetailsPage = async () => {
  notFound();
};

export default BlogDetailsPage;
