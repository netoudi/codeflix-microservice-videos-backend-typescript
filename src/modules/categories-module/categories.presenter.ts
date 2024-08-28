import { Transform } from 'class-transformer';
import { CategoryOutput } from '@/core/category/application/use-cases/common/category-output.mapper';

export class CategoriesPresenter {
  id: string;
  name: string;
  description: string | null;

  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.description = output.description;
    this.created_at = output.createdAt;
  }
}
