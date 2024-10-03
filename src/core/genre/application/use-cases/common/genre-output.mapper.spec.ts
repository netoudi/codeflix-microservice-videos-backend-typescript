import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSearchResult } from '@/core/genre/domain/genre.repository';

describe('GenreOutputMapper Unit Tests', () => {
  it('should convert a genre in output', () => {
    const genre = Genre.fake().aGenre().build();
    const output = GenreOutputMapper.toOutput(genre);
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      description: genre.description,
      is_active: genre.is_active,
      created_at: genre.created_at,
    });
  });

  it('should convert search result to pagination', () => {
    let result = new GenreSearchResult({
      items: [],
      total: 0,
      current_page: 1,
      per_page: 1,
    });
    let output = GenreOutputMapper.toPagination(result);
    expect(output).toStrictEqual({
      items: [],
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      last_page: result.last_page,
    });
    result = new GenreSearchResult({
      items: Genre.fake().theGenres(3).build(),
      total: 3,
      current_page: 1,
      per_page: 15,
    });
    output = GenreOutputMapper.toPagination(result);
    expect(output).toStrictEqual({
      items: result.items.map(GenreOutputMapper.toOutput),
      total: result.total,
      current_page: result.current_page,
      per_page: result.per_page,
      last_page: result.last_page,
    });
  });
});
