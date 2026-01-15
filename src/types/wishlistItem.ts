// NOTE: PortableTextBlock removed. Using generic type instead.
type PortableTextBlock = any;

export type WishlistItem = {
  _id: string;
  name: string;
  reviews: string[];
  price: number;
  discountedPrice: number;
  category?: string;
  tags?: string[];
  description?: PortableTextBlock[];
  shortDescription?: string;
  colors?: string[];
  thumbnails?: any;
  previewImages?: any;
  additionalInformation?: {
    name: string;
    description: string;
  }[];
  customAttributes?: {
    attributeName: string;
    attributeValues: Array<{
      id: string;
      title: string;
    }>;
  }[];
  status?: boolean;
  offers?: string[];
  slug?: {
    current: string;
  };
  price_id?: string;
  currency?: string;
  sku?: string;
  quantity: number;
  body?: PortableTextBlock[];
};
