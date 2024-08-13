import { Category } from '@/category/domain/category.entity';
import { ICategoryRepository } from '@/category/domain/category.repository';
import { IUseCase } from '@/shared/application/use-case.interface';

export class CreateCategoryUseCase implements IUseCase<CreateCategoryInput, CreateCategoryOutput> {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const category = Category.create(input);

    await this.categoryRepository.insert(category);

    return {
      id: category.id.value,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    };
  }
}

export type CreateCategoryInput = {
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type CreateCategoryOutput = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
};
