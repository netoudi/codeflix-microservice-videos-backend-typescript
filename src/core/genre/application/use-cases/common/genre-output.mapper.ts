import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSearchResult } from '@/core/genre/domain/genre.repository';
import { PaginationOutput, PaginationOutputMapper } from '@/core/shared/application/pagination-output.mapper';

export type GenreOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class GenreOutputMapper {
  static toOutput(genre: Genre): GenreOutput {
    return {
      id: genre.id.value,
      name: genre.name,
      description: genre.description,
      is_active: genre.is_active,
      created_at: genre.created_at,
    };
  }

  static toPagination(result: GenreSearchResult): PaginationOutput<GenreOutput> {
    return PaginationOutputMapper.toOutput(result.items.map(GenreOutputMapper.toOutput), result);
  }
}
