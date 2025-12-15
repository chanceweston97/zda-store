import BlogDetails from "@/components/BlogDetails";
import { getPost } from '@/sanity/sanity-blog-utils';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: "Blog Details Page | ZDAComm |  Store",
  description: "This is Blog Details Page for ZDAComm Template",
  // other metadata
};

const BlogDetailsPage = async () => {
  const slug = "cooking-masterclass-creating-delicious-italian-pasta";

  const blogData = await getPost(slug);

  return (
    <main>
      <BlogDetails blogData={blogData} />
    </main>
  );
};

export default BlogDetailsPage;
