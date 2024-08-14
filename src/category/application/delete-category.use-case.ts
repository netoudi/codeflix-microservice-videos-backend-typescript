import { ICategoryRepository } from '@/category/domain/category.repository';
import { IUseCase } from '@/shared/application/use-case.interface';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class DeleteCategoryUseCase implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput> {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    await this.categoryRepository.delete(new Uuid(input.id));
  }
}

export type DeleteCategoryInput = {
  id: string;
};

export type DeleteCategoryOutput = void;
