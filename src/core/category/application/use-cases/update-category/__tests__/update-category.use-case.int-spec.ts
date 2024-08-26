import { UpdateCategoryUseCase } from '@/core/category/application/use-cases/update-category/update-category.use-case';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('UpdateCategoryUseCase Integration Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
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
    const category = Category.fake().aCategory().withDescription(null).build();
    await repository.insert(category);
    const output = await useCase.execute({ id: category.id.value, name: 'test' });
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
      // check if really saved in the database
      const categoryUpdated = await repository.findById(category.id);
      expect(categoryUpdated).not.toBeNull();
      expect(categoryUpdated?.id.value).toBe(i.output.id);
      expect(categoryUpdated?.name).toBe(i.output.name);
      expect(categoryUpdated?.description).toBe(i.output.description);
      expect(categoryUpdated?.isActive).toBe(i.output.isActive);
      expect(categoryUpdated?.createdAt).toBeDefined();
    }
  });
});
