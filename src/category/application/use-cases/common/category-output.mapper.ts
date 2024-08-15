import { Category } from '@/category/domain/category.entity';
import { CategorySearchResult } from '@/category/domain/category.repository';
import { PaginationOutput, PaginationOutputMapper } from '@/shared/application/pagination-output.mapper';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

export class CategoryOutputMapper {
  static toOutput(category: Category): CategoryOutput {
    return {
      id: category.id.value,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    };
  }

  static toPagination(result: CategorySearchResult): PaginationOutput<CategoryOutput> {
    return PaginationOutputMapper.toOutput(result.items.map(CategoryOutputMapper.toOutput), result);
  }
}
