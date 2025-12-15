type Slug = {
  current: string;
  _type: string;
};

export type Category = {
  title: string;
  _id: string;
  image: string;
  slug: Slug;
  description?: string;
  productCount: number;
  postCount?: number;
  parent?: {
    _id: string;
    title: string;
    slug: Slug;
  } | null;
  subcategories?: Category[];
};
