export type PagedSlice<T> = {
  items: T[];
  page: number;
  pageSize: number;
  hasNext: boolean;
  totalCount: number;
};
