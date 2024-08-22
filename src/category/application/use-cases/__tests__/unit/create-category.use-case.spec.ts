import { CreateCategoryUseCase } from '@/category/application/use-cases/create-category.use-case';
import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';

describe('CreateCategoryUseCase Unit Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should throw error when category is not valid', async () => {
    await expect(useCase.execute({ name: 'x'.repeat(256) })).rejects.toThrow('Entity Validation Error');
  });

  it('should create a new category', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    let output = await useCase.execute({ name: 'test' });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].id.value,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: repository.items[0].createdAt,
    });
    output = await useCase.execute({ name: 'test', description: 'some description', isActive: false });
    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].id.value,
      name: 'test',
      description: 'some description',
      isActive: false,
      createdAt: repository.items[1].createdAt,
    });
  });
});
