import { Category } from '@/category/domain/category.entity';
import { ICategoryRepository } from '@/category/domain/category.repository';
import { IUseCase } from '@/shared/application/use-case.interface';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class UpdateCategoryUseCase implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput> {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const category = await this.categoryRepository.findById(new Uuid(input.id));

    if (!category) throw new NotFoundError(input.id, Category);

    'name' in input && category.changeName(input.name);
    'description' in input && category.changeDescription(input.description);
    'isActive' in input && category[input.isActive ? 'activate' : 'deactivate']();

    await this.categoryRepository.update(category);

    return {
      id: category.id.value,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    };
  }
}

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

export type UpdateCategoryOutput = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
};
