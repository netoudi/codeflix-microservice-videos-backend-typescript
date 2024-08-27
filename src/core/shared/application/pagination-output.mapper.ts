import { SearchResult } from '@/core/shared/domain/repository/search-result';

export type PaginationOutput<Item = any> = {
  items: Item[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
};

export class PaginationOutputMapper {
  static toOutput<Item = any>(items: Item[], props: Omit<SearchResult, 'items'>): PaginationOutput<Item> {
    return {
      items,
      total: props.total,
      currentPage: props.currentPage,
      perPage: props.perPage,
      lastPage: props.lastPage,
    };
  }
}
