import { configureStore } from "@reduxjs/toolkit";

import { type TypedUseSelectorHook, useSelector } from 'react-redux';
import { productApi } from './features/api/product';
import cartReducer from './features/cart-slice';
import productDetailsReducer from './features/product-details';
import quickViewReducer from './features/quickView-slice';
import wishlistReducer from './features/wishlist-slice';

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
