import { Category } from '@/category/domain/category.entity';
import { IRepository } from '@/shared/domain/repository/repository-interface';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export interface ICategoryRepository extends IRepository<Category, Uuid> {
  //
}
