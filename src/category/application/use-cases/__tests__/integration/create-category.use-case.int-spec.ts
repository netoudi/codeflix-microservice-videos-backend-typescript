import { CreateCategoryUseCase } from '@/category/application/use-cases/create-category.use-case';
import { CategorySequelizeRepository } from '@/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/category/infra/db/sequelize/category.model';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/shared/infra/testing/helpers';

describe('CreateCategoryUseCase Integration Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a new category', async () => {
    let output = await useCase.execute({ name: 'test' });
    let category = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: category.id.value,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: category.createdAt,
    });
    output = await useCase.execute({ name: 'test', description: 'some description', isActive: false });
    category = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: category.id.value,
      name: 'test',
      description: 'some description',
      isActive: false,
      createdAt: category.createdAt,
    });
  });
});
