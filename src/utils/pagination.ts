import { PaginationMeta } from './api-response';

export interface PaginationParams {
  page: number;
  limit: number;
}

export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? 10), 10) || 10));
  return { page, limit };
};

export const paginationSkipTake = (params: PaginationParams) => ({
  skip: (params.page - 1) * params.limit,
  take: params.limit,
});

export const buildPaginationMeta = (params: PaginationParams, total: number): PaginationMeta => ({
  page: params.page,
  limit: params.limit,
  total,
  totalPages: Math.ceil(total / params.limit),
});
