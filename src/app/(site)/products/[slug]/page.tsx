import { structuredAlgoliaHtmlData } from "@/algolia/crawlIndex";
import ShopDetails from "@/components/ShopDetails";
import {
  getCableSeries,
  getCableTypes,
  imageBuilder,
} from "@/lib/data/shop-utils";
import { getAllProducts, getProductBySlug } from "@/lib/data/unified-data";
import { getProductPrice } from "@/utils/getProductPrice";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => {
    // Use handle when available, otherwise slug.current
    const slug = (product as any)?.handle || product?.slug?.current;
    return slug ? { slug } : null;
  }).filter(Boolean) as { slug: string }[];
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL;

  if (!product) {
    return {
      title: "Not Found",
      description: "No blog article has been found",
    };
  }

  return {
    title: `${
      product.name || "Single Product Page"
    } | NextMerce - Next.js E-commerce Template`,
    description: `${product?.shortDescription?.slice(0, 136)}...`,
    author: "NextMerce",
    alternates: {
      canonical: `${siteURL}/products/${product?.slug?.current}`,
      languages: {
        "en-US": "/en-US",
        "de-DE": "/de-DE",
      },
    },

    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // openGraph: {
    //   title: `${product?.name} | NextMerce`,
    //   description: product.shortDescription,
    //   url: `${siteURL}/products/${product?.slug?.current}`,
    //   siteName: "NextMerce",
    //   images: [
    //     {
    //       url: imageBuilder(product?.previewImages[0]?.image).url(),
    //       width: 1800,
    //       height: 1600,
    //       alt: product?.name,
    //     },
    //   ],
    //   locale: "en_US",
    //   type: "article",
    // },

    // twitter: {
    //   card: "summary_large_image",
    //   title: `${product?.name} | NextMerce`,
    //   description: `${product?.shortDescription?.slice(0, 136)}...`,
    //   creator: "@NextMerce",
    //   site: "@NextMerce",
    //   images: [imageBuilder(product?.previewImages[0]?.image).url()],
    //   url: `${siteURL}/products/${product?.slug?.current}`,
    // },
  };
}

const ProductDetails = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    console.error(`[ProductDetails] Product not found for slug: ${slug}`);
    notFound();
  }

  const productPrice = getProductPrice(product);
  
  // Fetch cable series and types if this is a standalone connector
  // Standalone connectors have productType="connector" but no cableSeries/cableType (those are for connector products)
  const isStandaloneConnector = product.productType === "connector" && !product.cableSeries && !product.cableType && (product.connector?.pricing || product.pricing);
  const [cableSeries, cableTypes] = isStandaloneConnector
    ? await Promise.all([getCableSeries(), getCableTypes()])
    : [null, null];
  
  await structuredAlgoliaHtmlData({
    type: "products",
    title: product?.name,
    htmlString: product?.shortDescription,
    pageUrl: `${process.env.SITE_URL}/products/${product?.slug?.current}`,
    imageURL: imageBuilder(product?.previewImages?.[0]?.image || product?.thumbnails?.[0]?.image).url() as string,
    price: productPrice,
    discountedPrice: product?.discountedPrice || productPrice,
    reviews: product?.reviews?.length || 0,
    category: product?.category,
    colors: product?.colors as [],
    sizes: product?.sizes as [],
    _id: product?._id,
    thumbnails: product?.thumbnails,
    status: product?.status,
    previewImages: product?.previewImages,
  });

  return (
    <main>
      <ShopDetails 
        product={product} 
        cableSeries={cableSeries}
        cableTypes={cableTypes}
      />
    </main>
  );
};

export default ProductDetails;
