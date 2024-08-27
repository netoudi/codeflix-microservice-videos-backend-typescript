import { Category } from '@/core/category/domain/category.entity';
import { ISearchableRepository } from '@/core/shared/domain/repository/repository-interface';
import { SearchParams } from '@/core/shared/domain/repository/search-params';
import { SearchResult } from '@/core/shared/domain/repository/search-result';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export type CategoryFilter = string;

export class CategorySearchParams extends SearchParams<CategoryFilter> {}

export class CategorySearchResult extends SearchResult<Category> {}

export interface ICategoryRepository
  extends ISearchableRepository<Category, Uuid, CategoryFilter, CategorySearchParams, CategorySearchResult> {}
