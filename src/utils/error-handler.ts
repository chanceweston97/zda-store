import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type ApiErrorResponse = FetchBaseQueryError;

export function createRtkErrorResult(error: unknown): {
  error: ApiErrorResponse;
} {
  if (error instanceof Error) {
    return {
      error: {
        status: 'FETCH_ERROR',
        error: error.message,
      },
    };
  }

  return {
    error: {
      status: 'FETCH_ERROR',
      error: 'Something went wrong',
    },
  };
}
