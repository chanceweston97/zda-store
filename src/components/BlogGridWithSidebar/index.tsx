// NOTE: Sanity has been removed. Blog functionality is not available.

import Breadcrumb from "../Common/Breadcrumb";

const BlogGridWithSidebar = async () => {
  return (
    <>
      <Breadcrumb title={"Blog Grid Sidebar"} pages={["blog grid sidebar"]} />
      <section className="py-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
          <p className="text-gray-500">Blog functionality has been removed.</p>
        </div>
      </section>
    </>
  );
};

export default BlogGridWithSidebar;
