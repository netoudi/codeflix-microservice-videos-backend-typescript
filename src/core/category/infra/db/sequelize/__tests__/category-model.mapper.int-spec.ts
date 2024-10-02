import { Category, CategoryId } from '@/core/category/domain/category.entity';
import { CategoryModelMapper } from '@/core/category/infra/db/sequelize/category-model.mapper';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CategoryModelMapper Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  it('should throw error when category is invalid', async () => {
    expect.assertions(2);
    //@ts-expect-error - This is an invalid cast member
    const model = CategoryModel.build({
      id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
      name: 'x'.repeat(256),
    });
    try {
      CategoryModelMapper.toEntity(model);
      fail('The category is valid, but it needs to throws a EntityValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect((error as EntityValidationError).errors).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
  });

  it('should convert a category model to a category entity', async () => {
    const created_at = new Date();
    const model = CategoryModel.build({
      id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
      name: 'Movie',
      description: 'Movie description',
      is_active: true,
      created_at: created_at,
    });
    const entity = CategoryModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new Category({
        id: new CategoryId('c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c'),
        name: 'Movie',
        description: 'Movie description',
        is_active: true,
        created_at: created_at,
      }).toJSON(),
    );
  });

  it('should convert a category entity to a category model', async () => {
    const created_at = new Date();
    const entity = new Category({
      id: new CategoryId('c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c'),
      name: 'Movie',
      description: 'Movie description',
      is_active: true,
      created_at: created_at,
    });
    const model = CategoryModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual(
      CategoryModel.build({
        id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
        name: 'Movie',
        description: 'Movie description',
        is_active: true,
        created_at: created_at,
      }).toJSON(),
    );
  });

  it('should convert categories model to categories entity', async () => {
    const models = [
      CategoryModel.build({
        id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
        name: 'Movie',
        description: 'Movie description',
        is_active: true,
        created_at: new Date(),
      }),
      CategoryModel.build({
        id: 'd30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
        name: 'Kids',
        description: 'Kids description',
        is_active: true,
        created_at: new Date(),
      }),
    ];
    const entities = CategoryModelMapper.toEntities(models);
    expect(JSON.stringify(entities)).toStrictEqual(JSON.stringify(models));
  });

  it('should convert categories entity to categories model', async () => {
    const entities = Category.fake().theCategories(3).build();
    const models = CategoryModelMapper.toModels(entities);
    expect(JSON.stringify(models)).toStrictEqual(JSON.stringify(entities));
  });
});
