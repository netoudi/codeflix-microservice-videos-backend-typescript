import { UpdateCategoryUseCase } from '@/category/application/use-cases/update-category.use-case';
import { Category } from '@/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import { NotFoundError } from '@/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('UpdateCategoryUseCase Unit Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id', name: 'test' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value, name: 'test' })).rejects.toThrow(
      new NotFoundError(uuid.value, Category),
    );
  });

  it('should update a category', async () => {
    const spyInsert = jest.spyOn(repository, 'update');
    const category = new Category({ name: 'Movie' });
    repository.items = [category];
    const output = await useCase.execute({ id: category.id.value, name: 'test' });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: category.id.value,
      name: 'test',
      description: null,
      isActive: true,
      createdAt: category.createdAt,
    });
    type Arrange = {
      input: {
        id: string;
        name?: string;
        description?: string | null;
        isActive?: boolean;
      };
      output: {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          id: category.id.value,
          name: 'test',
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          id: category.id.value,
          name: 'test',
          isActive: false,
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: false,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          id: category.id.value,
          name: 'test',
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: false,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          id: category.id.value,
          name: 'test',
          isActive: true,
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: true,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: false,
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: 'some description',
          isActive: false,
          createdAt: category.createdAt,
        },
      },
      {
        input: {
          id: category.id.value,
          description: null,
        },
        output: {
          id: category.id.value,
          name: 'test',
          description: null,
          isActive: false,
          createdAt: category.createdAt,
        },
      },
    ];
    for (const i of arrange) {
      const output = await useCase.execute({
        id: i.input.id,
        ...('name' in i.input && { name: i.input.name }),
        ...('description' in i.input && { description: i.input.description }),
        ...('isActive' in i.input && { isActive: i.input.isActive }),
      });
      expect(output).toStrictEqual(i.output);
    }
  });
});
