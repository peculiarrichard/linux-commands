export const DEFAULT_PAGE_SIZE = 20;

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export function resolvePage(pageInput?: number): number {
  const page = Math.floor(pageInput ?? 1);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function totalPagesFor(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
