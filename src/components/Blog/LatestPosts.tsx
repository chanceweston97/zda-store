// NOTE: Blog functionality is not available.

import type { Blog } from '@/types/blogItem';

type PropsType = {
  data?: Blog[];
};

export default async function LatestPosts({ data }: PropsType) {
  // Return empty state since blog data is not available
  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Recent Posts</h2>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-gray-500">Blog functionality has been removed.</p>
      </div>
    </div>
  );
}
