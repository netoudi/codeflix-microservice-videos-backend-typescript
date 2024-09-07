import { Test, TestingModule } from '@nestjs/testing';
import { CategoryOutputMapper } from '@/core/category/application/use-cases/common/category-output.mapper';
import { CreateCategoryUseCase } from '@/core/category/application/use-cases/create-category/create-category.use-case';
import { DeleteCategoryUseCase } from '@/core/category/application/use-cases/delete-category/delete-category.use-case';
import { GetCategoryUseCase } from '@/core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesUseCase } from '@/core/category/application/use-cases/list-category/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/core/category/application/use-cases/update-category/update-category.use-case';
import { Category } from '@/core/category/domain/category.entity';
import { ICategoryRepository } from '@/core/category/domain/category.repository';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { CategoryCollectionPresenter, CategoryPresenter } from '@/modules/categories-module/categories.presenter';
import { CATEGORY_PROVIDERS } from '@/modules/categories-module/categories.providers';
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from '@/modules/categories-module/testing/category-fixture';
import { ConfigModule } from '@/modules/config-module/config.module';
import { DatabaseModule } from '@/modules/database-module/database.module';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>(CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateCategoryUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateCategoryUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListCategoriesUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetCategoryUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteCategoryUseCase);
  });

  describe('should create a category', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();
    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.create(send_data);
      const entity = await repository.findById(new Uuid(presenter.id));
      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        name: expected.name,
        description: expected.description,
        is_active: expected.is_active,
        created_at: presenter.created_at,
      });
      const output = CategoryOutputMapper.toOutput(entity);
      expect(presenter).toEqual(new CategoryPresenter(output));
    });
  });

  describe('should update a category', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();
    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)('when body is $send_data', async ({ send_data, expected }) => {
      const presenter = await controller.update(category.id.value, send_data);
      const entity = await repository.findById(new Uuid(presenter.id));
      expect(entity.toJSON()).toStrictEqual({
        id: presenter.id,
        name: expected.name ?? category.name,
        description: 'description' in expected ? expected.description : category.description,
        is_active:
          expected.is_active === true || expected.is_active === false ? expected.is_active : category.is_active,
        created_at: presenter.created_at,
      });
      const output = CategoryOutputMapper.toOutput(entity);
      expect(presenter).toEqual(new CategoryPresenter(output));
    });
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const response = await controller.remove(category.id.value);
    expect(response).not.toBeDefined();
    await expect(repository.findById(category.id)).resolves.toBeNull();
  });

  it('should get a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const presenter = await controller.findOne(category.id.value);
    expect(presenter.id).toBe(category.id.value);
    expect(presenter.name).toBe(category.name);
    expect(presenter.description).toBe(category.description);
    expect(presenter.is_active).toBe(category.is_active);
    expect(presenter.created_at).toStrictEqual(category.created_at);
  });

  describe('search method', () => {
    describe('should sorted categories by created_at', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        expect(presenter).toEqual(
          new CategoryCollectionPresenter({
            items: entities.map(CategoryOutputMapper.toOutput),
            currentPage: paginationProps.meta.current_page,
            lastPage: paginationProps.meta.last_page,
            perPage: paginationProps.meta.per_page,
            total: paginationProps.meta.total,
          }),
        );
      });
    });

    describe('should return categories using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)('when send_data is $send_data', async ({ send_data, expected }) => {
        const presenter = await controller.search(send_data);
        const { entities, ...paginationProps } = expected;
        expect(presenter).toEqual(
          new CategoryCollectionPresenter({
            items: entities.map(CategoryOutputMapper.toOutput),
            currentPage: paginationProps.meta.current_page,
            lastPage: paginationProps.meta.last_page,
            perPage: paginationProps.meta.per_page,
            total: paginationProps.meta.total,
          }),
        );
      });
    });
  });
});
