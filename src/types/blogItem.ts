// PortableTextBlock type - no longer from a CMS schema
type PortableTextBlock = any;
import { Author } from "./author";

export type Blog = {
  _id: number;
  title: string;
  slug: any;
  category: string;
  metadata?: string;
  metaDescription?: string;
  body?: PortableTextBlock[];
  mainImage?: any;
  author?: Author;
  tags?: string[];
  publishedAt?: string;
};
