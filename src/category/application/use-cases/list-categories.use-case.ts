import { CategoryOutput, CategoryOutputMapper } from '@/category/application/use-cases/common/category-output.mapper';
import { PaginationOutput } from '@/category/application/use-cases/common/pagination-output.mapper';
import { CategoryFilter, CategorySearchParams, ICategoryRepository } from '@/category/domain/category.repository';
import { IUseCase } from '@/shared/application/use-case.interface';
import { SortDirection } from '@/shared/domain/repository/search-params';

export class ListCategoriesUseCase implements IUseCase<ListCategoriesInput, ListCategoriesOutput> {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const result = await this.categoryRepository.search(new CategorySearchParams(input));

    return CategoryOutputMapper.toPagination(result);
  }
}

export type ListCategoriesInput = {
  page?: number;
  perPage?: number;
  sort?: string;
  sortDir?: SortDirection | null;
  filter?: CategoryFilter | null;
};

export type ListCategoriesOutput = PaginationOutput<CategoryOutput>;
