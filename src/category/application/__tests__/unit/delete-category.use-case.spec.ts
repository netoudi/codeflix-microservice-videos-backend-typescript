import { DeleteCategoryUseCase } from '@/category/application/delete-category.use-case';
import { Category } from '@/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('DeleteCategoryUseCase Unit Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, Category));
  });

  it('should delete a category', async () => {
    const items = [Category.fake().aCategory().build()];
    repository.items = items;
    await useCase.execute({ id: items[0].id.value });
    expect(repository.items).toHaveLength(0);
  });
});
