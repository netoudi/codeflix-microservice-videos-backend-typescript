import { CreateCategoryUseCase } from '@/core/category/application/use-cases/create-category/create-category.use-case';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

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
      is_active: true,
      created_at: category.created_at,
    });
    output = await useCase.execute({ name: 'test', description: 'some description', is_active: false });
    category = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: category.id.value,
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: category.created_at,
    });
  });
});
