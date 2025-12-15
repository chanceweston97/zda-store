import { getProductsByFilter } from "@/lib/data/shop-utils";
import { Product } from "@/types/product";
import type { Review } from "@prisma/client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  tagTypes: ["product", "category", "reviews"],
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    validateStatus: (res) => res.status >= 200 && res.status < 300,
  }),
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], number | void>({
      query: (limit) =>
        limit ? `/api/products?limit=${limit}` : "/api/products",
      providesTags: ["product"],
    }),
    getProductReviews: builder.query({
      query: (productId: string) => `/api/review/${productId}`,
      transformResponse: (response: { reviews: Review[] }) => response.reviews,
      providesTags: ["reviews"],
    }),
    addProductReview: builder.mutation({
      query: (review: Omit<Review, "id">) => ({
        url: "/api/review",
        method: "POST",
        body: review,
      }),
      invalidatesTags: ["reviews"],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useAddProductReviewMutation,
  useGetProductsQuery,
} = productApi;
