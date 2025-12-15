import { structuredAlgoliaHtmlData } from '@/algolia/crawlIndex';
import BlogDetails from '@/components/BlogDetails';
import { getPost, getPosts } from '@/sanity/sanity-blog-utils';
import { imageBuilder } from "@/lib/data/shop-utils";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug.current,
  }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL;

  if (post) {
    return {
      title: `${
        post.title || 'Single Post Page'
      } | ZDAComm -  E-commerce Template`,
      description: `${post.metadata?.slice(0, 136)}...`,
      author: 'ZDAComm',
      alternates: {
        canonical: `${siteURL}/posts/${post?.slug?.current}`,
        languages: {
          'en-US': '/en-US',
          'de-DE': '/de-DE',
        },
      },

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      openGraph: {
        title: `${post.title} | ZDAComm`,
        description: post.metadata,
        url: `${siteURL}/posts/${post?.slug?.current}`,
        siteName: 'ZDAComm',
        images: [
          {
            url: imageBuilder(post.mainImage).url(),
            width: 1800,
            height: 1600,
            alt: post.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },

      twitter: {
        card: 'summary_large_image',
        title: `${post.title} | ZDAComm`,
        description: `${post.metadata?.slice(0, 136)}...`,
        creator: '@ZDAComm',
        site: '@ZDAComm',
        images: [imageBuilder(post?.mainImage).url()],
        url: `${siteURL}/blogs/${post?.slug?.current}`,
      },
    };
  } else {
    return {
      title: 'Not Found',
      description: 'No blog article has been found',
    };
  }
}

const BlogDetailsPage = async ({ params }: Params) => {
  const { slug } = await params;
  const post = await getPost(slug);

  await structuredAlgoliaHtmlData({
    type: 'blogs',
    title: post?.title || '',
    htmlString: post?.metadata || '',
    pageUrl: `${process.env.SITE_URL}/blogs/${post?.slug?.current}`,
    imageURL: imageBuilder(post?.mainImage).url() as string,
  });

  return (
    <main>
      <BlogDetails blogData={post} />
    </main>
  );
};

export default BlogDetailsPage;
