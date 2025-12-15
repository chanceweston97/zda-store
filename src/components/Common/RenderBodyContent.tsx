import { Blog } from "@/types/blogItem";
import Image from "next/image";

// Helper function to render body content (replaces PortableText)
const renderContent = (content: any): React.ReactNode => {
  if (!content) return null;
  
  if (typeof content === 'string') {
    return <div className="whitespace-pre-line">{content}</div>;
  }
  
  if (Array.isArray(content)) {
    if (content.length === 0) return null;
    
    const isPortableText = content[0] && typeof content[0] === 'object' && '_type' in content[0];
    
    if (isPortableText) {
      return (
        <div>
          {content.map((block: any, index: number) => {
            if (block._type === 'block' && block.children) {
              return (
                <p key={index} className="mb-2">
                  {block.children.map((child: any, childIndex: number) => {
                    if (child.text) {
                      return <span key={childIndex}>{child.text}</span>;
                    }
                    return null;
                  })}
                </p>
              );
            }
            if (block._type === 'image') {
              const imageUrl = typeof block.asset === 'string' 
                ? block.asset 
                : block.asset?.url || block.url || '';
              const width = block.asset?.metadata?.dimensions?.width || 800;
              const height = block.asset?.metadata?.dimensions?.height || 600;
              return (
                <Image
                  key={index}
                  src={imageUrl}
                  width={width}
                  height={height}
                  alt={block.alt || "blog image"}
                  loading="lazy"
                  className="my-4"
                />
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    return (
      <div>
        {content.map((item: any, index: number) => (
          <div key={index} className="mb-2">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  }
  
  return <div>{JSON.stringify(content)}</div>;
};

const RenderBodyContent = ({ post }: { post: Blog }) => {
  return <>{renderContent(post?.body || [])}</>;
};

export default RenderBodyContent;