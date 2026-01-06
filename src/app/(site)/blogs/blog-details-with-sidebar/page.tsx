import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Details Page | ZDA Communications',
  description: 'Blog functionality has been removed',
};

const BlogDetailsWithSidebarPage = async () => {
  notFound();
};

export default BlogDetailsWithSidebarPage;
