import { CategoryOutput, CategoryOutputMapper } from '@/category/application/use-cases/common/category-output.mapper';
import { Category } from '@/category/domain/category.entity';
import { ICategoryRepository } from '@/category/domain/category.repository';
import { IUseCase } from '@/shared/application/use-case.interface';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class GetCategoryUseCase implements IUseCase<GetCategoryInput, GetCategoryOutput> {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const category = await this.categoryRepository.findById(new Uuid(input.id));

    if (!category) throw new NotFoundError(input.id, Category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;
