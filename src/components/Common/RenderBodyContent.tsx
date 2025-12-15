import { Blog } from "@/types/blogItem";
import { PortableText } from "@portabletext/react";
import Image from "next/image";

// Barebones lazy-loaded image component
const SampleImageComponent = ({ value, isInline }: any) => {
  // Handle local image URLs (strings) or Sanity-compatible objects
  const imageUrl = typeof value === 'string' 
    ? value 
    : value?.asset?.url || value?.url || '';
  
  const width = value?.width || value?.asset?.metadata?.dimensions?.width || 800;
  const height = value?.height || value?.asset?.metadata?.dimensions?.height || 600;
  
  return (
    <Image
      src={imageUrl}
      width={width}
      height={height}
      alt={value?.alt || "blog image"}
      loading="lazy"
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? "inline-block" : "block",

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
      }}
    />
  );
};

const components = {
  types: {
    image: SampleImageComponent,
  },
};

const RenderBodyContent = ({ post }: { post: Blog }) => {
  return (
    <>
      <PortableText value={post?.body || []} components={components} />
    </>
  );
};

export default RenderBodyContent;