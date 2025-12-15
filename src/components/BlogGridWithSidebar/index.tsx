import { getPosts } from "@/sanity/sanity-blog-utils";
import BlogItem from "../Blog/BlogItem";
import Categories from "../Blog/Categories";
import LatestPosts from "../Blog/LatestPosts";
import LatestProducts from "../Blog/LatestProducts";
import SearchForm from "../Blog/SearchForm";
import Tags from "../Blog/Tags";
import Breadcrumb from "../Common/Breadcrumb";
// import GlobalSearchModal from "../Common/GlobalSearch";

const BlogGridWithSidebar = async () => {
  const blogData = await getPosts();

  return (
    <>
      <Breadcrumb title={"Blog Grid Sidebar"} pages={["blog grid sidebar"]} />

      <section className="py-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5">
            {/* <!-- blog grid --> */}
            <div className="w-full lg:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                {blogData &&
                  blogData.map((blog) => (
                    <BlogItem blog={blog} key={blog._id} />
                  ))}
              </div>
            </div>

            {/* <!-- blog sidebar --> */}
            <div className="w-full lg:w-1/3">
              {/* <!-- search box --> */}
              <SearchForm />

              {/* <!-- Recent Posts box --> */}
              <LatestPosts data={blogData} />

              {/* <!-- Latest Products box --> */}
              <LatestProducts />

              {/* <!-- Popular Category box --> */}
              <Categories />

              {/* <!-- Tags box --> */}
              <Tags />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGridWithSidebar;
