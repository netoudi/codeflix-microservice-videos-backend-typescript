import { GetCategoryUseCase } from '@/category/application/use-cases/get-category.use-case';
import { Category } from '@/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('GetCategoryUseCase Unit Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, Category));
  });

  it('should return a category', async () => {
    const items = [Category.fake().aCategory().build()];
    repository.items = items;
    const spyFindById = jest.spyOn(repository, 'findById');
    const output = await useCase.execute({ id: items[0].id.value });
    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].id.value,
      name: items[0].name,
      description: items[0].description,
      isActive: items[0].isActive,
      createdAt: items[0].createdAt,
    });
  });
});
