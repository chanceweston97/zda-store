import { getPosts } from "@/sanity/sanity-blog-utils";
import BlogItem from "../Blog/BlogItem";
import Breadcrumb from "../Common/Breadcrumb";

const BlogGrid = async () => {
  const blogData = await getPosts();

  return (
    <>
      <Breadcrumb title={"Blog Grid"} pages={["blog grid"]} />{" "}
      <section className="py-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
            {blogData.map((blog) => (
              <BlogItem blog={blog} key={blog._id} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
