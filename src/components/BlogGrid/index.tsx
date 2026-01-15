// NOTE: Blog functionality is not available.

import BlogItem from "../Blog/BlogItem";
import Breadcrumb from "../Common/Breadcrumb";

const BlogGrid = async () => {
  return (
    <>
      <Breadcrumb title={"Blog Grid"} pages={["blog grid"]} />
      <section className="py-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <p className="text-gray-500">Blog functionality has been removed.</p>
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
