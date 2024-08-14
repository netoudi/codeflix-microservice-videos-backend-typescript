import { GetCategoryUseCase } from '@/category/application/get-category.use-case';
import { Category } from '@/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/shared/infra/testing/helpers';

describe('GetCategoryUseCase Integration Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, Category));
  });

  it('should return a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const output = await useCase.execute({ id: category.id.value });
    expect(output).toStrictEqual({
      id: category.id.value,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });
  });
});
