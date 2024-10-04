import { CategoryId } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { GenreOutput, GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { ListGenresInput } from '@/core/genre/application/use-cases/list-genre/list-genres.input';
import { GenreSearchParams, GenreSearchResult, IGenreRepository } from '@/core/genre/domain/genre.repository';
import { PaginationOutput, PaginationOutputMapper } from '@/core/shared/application/pagination-output.mapper';
import { IUseCase } from '@/core/shared/application/use-case.interface';

export class ListGenresUseCase implements IUseCase<ListGenresInput, ListGenresOutput> {
  constructor(
    private readonly genreRepository: IGenreRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: ListGenresInput): Promise<ListGenresOutput> {
    const result = await this.genreRepository.search(GenreSearchParams.create(input));
    return this.toOutput(result);
  }

  private async toOutput(searchResult: GenreSearchResult): Promise<ListGenresOutput> {
    const { items: _items } = searchResult;
    const categoriesIdRelated = searchResult.items.reduce<CategoryId[]>(
      (acc, item) => acc.concat([...item.categories_id.values()]),
      [],
    );
    const categoriesRelated = await this.categoryRepository.findByIds(categoriesIdRelated);
    const items = _items.map((i) => {
      const categoriesOfGenre = categoriesRelated.filter((c) => i.categories_id.has(c.id.value));
      return GenreOutputMapper.toOutput(i, categoriesOfGenre);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListGenresOutput = PaginationOutput<GenreOutput>;
