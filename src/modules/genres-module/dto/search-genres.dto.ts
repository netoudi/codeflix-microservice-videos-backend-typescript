import { ListGenresFilter, ListGenresInput } from '@/core/genre/application/use-cases/list-genre/list-genres.input';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class SearchGenresDto implements ListGenresInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: ListGenresFilter;
}
