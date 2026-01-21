import BlogGridWithSidebar from '@/components/BlogGridWithSidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Grid Page | ZDA Communications',
  description: 'This is Blog Grid Page for ZDA Communications',
  // other metadata
};

const BlogGridWithSidebarPage = () => {
  return (
    <>
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
