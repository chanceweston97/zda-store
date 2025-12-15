import { groq } from "next-sanity";

export const postData = `{
  _id,
  title,
  metadata,
  postCategory,
  slug,
  tags,
  author->{
    _id,
    name,
    slug,
    image,
    bio,
    description
  },
  mainImage,
  publishedAt,
  body
}`;

export const postCategoryQuery = groq`
*[_type == "postCategory"] {
  _id,
  title,
  image,
  slug,
  "postCount": count(*[_type == "post" && references(^._id)])
}
`;

export const postByCategoryQuery = groq`*[_type == "post" && postCategory->slug.current == $slug] ${postData}`;

export const authorBySlugQuery = groq`*[_type == "author" && slug.current == $slug ] {
  _id, 
  name,
  slug, 
  image, 
  bio,
  description
}[0]`;

export const postQuery = groq`*[_type == "post"] ${postData}`;

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] ${postData}`;

export const categoryBySlugQuery = groq`*[_type == "postCategory" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  "postCount": count(*[_type == "post" && references(^._id)])
}`;
