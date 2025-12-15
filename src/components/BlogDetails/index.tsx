"use client";
import { imageBuilder } from "@/lib/data/shop-utils";
import { Blog } from "@/types/blogItem";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import SocialShare from "../Blog/SocialShare";
import Breadcrumb from "../Common/Breadcrumb";

const BlogDetails = ({ blogData }: { blogData: Blog }) => {
  return (
    <>
      <Breadcrumb
        title={"Blog Details"}
        pages={["blog", "/", "blog details"]}
      />
      <section className="overflow-hidden py-20 bg-gray-2">
        {blogData ? (
          <div className="max-w-[850px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="rounded-[10px] overflow-hidden mb-7.5">
              <Image
                className="rounded-[10px] h-[477px] w-full object-cover"
                src={
                  blogData.mainImage
                    ? imageBuilder(blogData?.mainImage).url()!
                    : ""
                }
                alt="details"
                width={750}
                height={477}
              />
            </div>

            <div>
              <span className="flex items-center gap-3 mb-4">
                <Link
                  href="#"
                  className="ease-out duration-200 hover:text-blue"
                >
                  {blogData.publishedAt &&
                    new Date(blogData.publishedAt)
                      .toDateString()
                      .split(" ")
                      .slice(1)
                      .join(" ")}
                </Link>

                {/* <!-- divider --> */}
                <span className="block w-px h-4 bg-gray-4"></span>

                <Link
                  href="#"
                  className="ease-out duration-200 hover:text-blue"
                >
                  300k Views
                </Link>
              </span>

              <h2 className="font-medium text-dark text-xl lg:text-2xl xl:text-custom-4xl mb-4">
                {blogData?.title}
              </h2>

              <div className="blog-details">
                <PortableText value={blogData?.body as any} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-10 mt-10">
                <div className="flex flex-wrap items-center gap-5">
                  <p>Tags:</p>

                  <ul className="flex flex-wrap items-center gap-3.5">
                    {blogData?.tags?.map((tag, key) => (
                      <li key={key}>
                        <Link
                          className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-full ease-out duration-200 hover:bg-blue hover:border-blue capitalize"
                          href={`/blogs/tags/${tag}`}
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <SocialShare slug={blogData?.slug} />
                {/* <!-- Social Links end --> */}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-2xl text-center">Post Not Found!</p>
        )}
      </section>
    </>
  );
};

export default BlogDetails;
