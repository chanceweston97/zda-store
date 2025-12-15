import { Blog } from '@/types/blogItem';
import { Category } from '@/types/category';
import { groq } from 'next-sanity';
import {
  authorBySlugQuery,
  categoryBySlugQuery,
  postBySlugQuery,
  postCategoryQuery,
  postData,
  postQuery,
} from './queries/blog-queries';
import { sanityFetch } from './sanity-utils';

export async function getPostCategories() {
  const data: Category[] = await sanityFetch({
    query: postCategoryQuery,
    qParams: {},
    tags: ['post'],
  });
  return data;
}

export async function getPostTags() {
  const data: Blog[] = await sanityFetch({
    query: groq`*[_type == "post" && defined(tags)] {
      'tags': tags[]
    }`,
    qParams: {},
    tags: ['post'],
  });

  return data;
}
export async function getAuthorBySlug(slug: string) {
  const data = await sanityFetch({
    query: authorBySlugQuery,
    qParams: { slug },
    tags: ['author'],
  });
  return data;
}

export async function getPosts() {
  const data: Blog[] = await sanityFetch({
    query: postQuery,
    qParams: {},
    tags: ['post'],
  });
  return data;
}

export async function getPostsByLimit(limit: number) {
  const data: Blog[] = await sanityFetch({
    query: postQuery + `[0...${limit}]`,
    qParams: {},
    tags: ['post'],
  });
  return data;
}

export async function getPostsByAuthorSlug(authorSlug: string) {
  const data = await sanityFetch({
    query: groq`*[_type == "post" && author->slug.current == $authorSlug] ${postQuery}`,
    qParams: { authorSlug },
    tags: ['post'],
  });
  return data;
}

export async function getPostsByCategoryOrTag(slug: string) {
  const query = `postCategory->slug.current == "${slug}"`;

  const data: Blog[] = await sanityFetch({
    query: groq`*[_type == "post" && ${query}] ${postData}`,
    qParams: {},
    tags: ['post'],
  });
  return data;
}

export async function getCategoryBySlug(slug: string) {
  const data: Category = await sanityFetch({
    query: categoryBySlugQuery,
    qParams: { slug },
    tags: ['post'],
  });
  return data;
}

export async function getPost(slug: string) {
  const data: Blog = await sanityFetch({
    query: postBySlugQuery,
    qParams: { slug },
    tags: ['post'],
  });
  return data;
}
