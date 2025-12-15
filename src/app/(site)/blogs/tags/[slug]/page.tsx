import BlogItem from '@/components/Blog/BlogItem';
import Breadcrumb from '@/components/Common/Breadcrumb';
import { getPostsByCategoryOrTag } from '@/sanity/sanity-blog-utils';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const BlogGrid = async ({ params }: Props) => {
  const { slug } = await params;
  const blogData = await getPostsByCategoryOrTag(slug);

  return (
    <>
      <Breadcrumb title={`${slug ? slug : 'Blog Tags'}`} pages={['Tags']} />{' '}
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
            {blogData.map((blog) => (
              <BlogItem blog={blog} key={blog._id} />
            ))}

            {!blogData.length && <p>No posts found!</p>}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
