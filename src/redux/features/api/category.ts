import { getCategoriesWithSubcategories } from '@/lib/data/unified-data';
import type { Category } from '@/types/category';
import { createRtkErrorResult } from '@/utils/error-handler';
import { productApi } from './product';

export const categoryApi = productApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const categories = await getCategoriesWithSubcategories();
          return { data: categories };
        } catch (error) {
          return createRtkErrorResult(error);
        }
      },
      providesTags: ['category'],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;
