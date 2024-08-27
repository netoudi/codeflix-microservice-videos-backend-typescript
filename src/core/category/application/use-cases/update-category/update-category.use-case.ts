import {
  CategoryOutput,
  CategoryOutputMapper,
} from '@/core/category/application/use-cases/common/category-output.mapper';
import { UpdateCategoryInput } from '@/core/category/application/use-cases/update-category/update-category.input';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { IUseCase } from '@/core/shared/application/use-case.interface';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { EntityValidationError } from '@/core/shared/domain/validators/entity-validation.error';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export class UpdateCategoryUseCase implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput> {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const category = await this.categoryRepository.findById(new Uuid(input.id));

    if (!category) throw new NotFoundError(input.id, Category);

    'name' in input && category.changeName(input.name);
    'description' in input && category.changeDescription(input.description);
    'isActive' in input && category[input.isActive ? 'activate' : 'deactivate']();

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.categoryRepository.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export type UpdateCategoryOutput = CategoryOutput;
