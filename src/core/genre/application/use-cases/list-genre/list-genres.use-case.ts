import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { GenreFilter, GenreSearchParams, IGenreRepository } from '@/core/genre/domain/genre.repository';
import { PaginationOutput } from '@/core/shared/application/pagination-output.mapper';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

export class ListGenresUseCase implements IUseCase<ListGenresInput, ListGenresOutput> {
  constructor(private readonly genreRepository: IGenreRepository) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const result = await this.genreRepository.search(new GenreSearchParams(input));

    return GenreOutputMapper.toPagination(result);
  }
}

export type ListGenresInput = {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection | null;
  filter?: GenreFilter | null;
};

export type ListGenresOutput = PaginationOutput<GenreOutput>;
