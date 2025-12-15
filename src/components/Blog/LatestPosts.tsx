import { getPostsByLimit } from '@/sanity/sanity-blog-utils';
import { imageBuilder } from "@/lib/data/shop-utils";
import type { Blog } from '@/types/blogItem';
import Image from 'next/image';
import Link from 'next/link';

type PropsType = {
  data?: Blog[];
};

export default async function LatestPosts({ data }: PropsType) {
  if (!data) {
    data = await getPostsByLimit(3);
  }

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Recent Posts</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* <!-- post item --> */}

          {data.slice(0, 3).map((blog) => (
            <div className="flex items-center gap-4" key={blog._id}>
              <Link
                href={`/blogs/${blog.slug.current}`}
                className="max-w-[110px] w-full rounded-[10px] overflow-hidden"
              >
                <Image
                  src={
                    blog.mainImage ? imageBuilder(blog?.mainImage).url()! : ''
                  }
                  alt="blog"
                  className="rounded-[10px] w-full h-20 object-cover"
                  width={110}
                  height={80}
                />
              </Link>

              <Link href={`/blogs/${blog.slug.current}`}>
                <h3 className="text-dark leading-[22px] ease-out duration-200 mb-1.5 hover:text-blue">
                  {blog.title.length > 40
                    ? blog.title.slice(0, 40) + '...'
                    : blog.title}
                </h3>

                <div className="flex items-center gap-3">
                  <div className="text-custom-xs ease-out duration-200">
                    {blog.publishedAt &&
                      new Date(blog.publishedAt)
                        .toDateString()
                        .split(' ')
                        .slice(1)
                        .join(' ')}
                  </div>

                  {/* <!-- divider --> */}
                  <div className="block w-px h-4 bg-gray-4"></div>

                  <div className="text-custom-xs ease-out duration-200">
                    100k Views
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
