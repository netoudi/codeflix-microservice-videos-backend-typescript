import { Category, CategoryId } from '@/core/category/domain/category.entity';
import { CategorySearchParams, CategorySearchResult } from '@/core/category/domain/category.repository';
import { CategoryModelMapper } from '@/core/category/infra/db/sequelize/category-model.mapper';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CategorySequelizeRepository Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  let repository: CategorySequelizeRepository;

  beforeEach(async () => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  it('should insert a new category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const entity = await repository.findById(category.id);
    expect(entity!.toJSON()).toStrictEqual(category.toJSON());
  });

  it('should find a category by id', async () => {
    let entity = await repository.findById(new CategoryId());
    expect(entity).toBeNull();
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    entity = await repository.findById(category.id);
    expect(entity!.toJSON()).toStrictEqual(category.toJSON());
  });

  it('should return all categories', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    const categories = await repository.findAll();
    expect(categories).toHaveLength(1);
    expect(JSON.stringify(categories)).toStrictEqual(JSON.stringify([category]));
  });

  it('should throw error on update when a category is not found', async () => {
    const category = Category.fake().aCategory().build();
    await expect(repository.update(category)).rejects.toThrow(new NotFoundError(category.id, Category));
  });

  it('should update a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    category.changeName('name-updated');
    await repository.update(category);
    const entity = await repository.findById(category.id);
    expect(entity!.toJSON()).toStrictEqual(category.toJSON());
    expect(entity!.name).toBe('name-updated');
  });

  it('should throw error on delete when a category is not found', async () => {
    const category = Category.fake().aCategory().build();
    await expect(repository.delete(category.id)).rejects.toThrow(new NotFoundError(category.id, Category));
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await repository.delete(category.id);
    await expect(repository.findById(category.id)).resolves.toBeNull();
  });

  describe('search method tests', () => {
    it('should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName('Movie')
        .withDescription(null)
        .withCreatedAt(created_at)
        .build();
      await repository.bulkInsert(categories);
      const spyToEntity = jest.spyOn(CategoryModelMapper, 'toEntity');
      const result = await repository.search(new CategorySearchParams());
      expect(result).toBeInstanceOf(CategorySearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(result.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        per_page: 15,
        last_page: 2,
      });
      result.items.forEach((category) => {
        expect(category).toBeInstanceOf(Category);
        expect(category.id).toBeDefined();
      });
      const items = result.items.map((category) => category.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'Movie',
          description: null,
          is_active: true,
          created_at: created_at,
        }),
      );
    });

    it('should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const categories = Category.fake()
        .theCategories(16)
        .withName((index) => `Movie ${index}`)
        .withDescription(null)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      await repository.bulkInsert(categories);
      const result = await repository.search(new CategorySearchParams());
      const items = result.items;
      [...items].reverse().forEach((category, index) => {
        expect(category.name).toBe(categories[index + 1].name);
      });
    });

    it('should apply paginate and filter', async () => {
      const categories = [
        Category.fake()
          .aCategory()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Category.fake()
          .aCategory()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];
      await repository.bulkInsert(categories);
      let result = await repository.search(
        new CategorySearchParams({
          page: 1,
          per_page: 2,
          filter: 'TEST',
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[0], categories[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );
      result = await repository.search(
        new CategorySearchParams({
          page: 2,
          per_page: 2,
          filter: 'TEST',
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CategorySearchResult({
          items: [categories[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );
    });

    it('should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);
      const categories = [
        Category.fake().aCategory().withName('b').build(),
        Category.fake().aCategory().withName('a').build(),
        Category.fake().aCategory().withName('d').build(),
        Category.fake().aCategory().withName('e').build(),
        Category.fake().aCategory().withName('c').build(),
      ];
      await repository.bulkInsert(categories);
      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 3,
            per_page: 2,
            sort: 'name',
          }),
          result: new CategorySearchResult({
            items: [categories[3]],
            total: 5,
            current_page: 3,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new CategorySearchResult({
            items: [categories[3], categories[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
      ];
      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const categories = [
        Category.fake().aCategory().withName('test').build(),
        Category.fake().aCategory().withName('a').build(),
        Category.fake().aCategory().withName('TEST').build(),
        Category.fake().aCategory().withName('e').build(),
        Category.fake().aCategory().withName('TeSt').build(),
      ];

      const arrange = [
        {
          params: new CategorySearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new CategorySearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CategorySearchParams({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: 'TEST',
          }),
          result: new CategorySearchResult({
            items: [categories[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)('when value is $params', async ({ params, result }) => {
        const output = await repository.search(params);
        expect(output.toJSON(true)).toMatchObject(result.toJSON(true));
      });
    });
  });
});
