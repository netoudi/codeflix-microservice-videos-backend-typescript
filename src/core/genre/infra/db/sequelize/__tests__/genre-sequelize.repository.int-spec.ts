import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreSearchParams, GenreSearchResult } from '@/core/genre/domain/genre.repository';
import { GenreModelMapper } from '@/core/genre/infra/db/sequelize/genre-model.mapper';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel, GenreCategoryModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('GenreSequelizeRepository Integration Tests', () => {
  setupSequelize({ models: [GenreModel, GenreCategoryModel, CategoryModel] });

  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  beforeEach(async () => {
    genreRepo = new GenreSequelizeRepository(GenreModel);
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  it('should insert a new entity', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepo.insert(genre);
    const newGenre = await genreRepo.findById(genre.id);
    expect(newGenre!.toJSON()).toStrictEqual(genre.toJSON());
  });

  it('should bulk insert new entities', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genres = Genre.fake()
      .theGenres(2)
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addCategoryId(categories[2].id)
      .build();
    await genreRepo.bulkInsert(genres);
    const newGenres = await genreRepo.findAll();
    expect(newGenres.length).toBe(2);
    expect(newGenres[0].toJSON()).toStrictEqual({
      ...genres[0].toJSON(),
      categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value, categories[2].id.value]),
    });
    expect(newGenres[1].toJSON()).toStrictEqual({
      ...genres[1].toJSON(),
      categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value, categories[2].id.value]),
    });
  });

  it('should find a entity by id', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepo.insert(genre);

    const entityFound = await genreRepo.findById(genre.id);
    expect(genre.toJSON()).toStrictEqual(entityFound!.toJSON());

    await expect(genreRepo.findById(new GenreId())).resolves.toBeNull();
  });

  it('should return all categories', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const entity = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepo.insert(entity);
    const entities = await genreRepo.findAll();
    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]));
  });

  it('should throw error on update when a entity not found', async () => {
    const entity = Genre.fake().aGenre().build();
    await expect(genreRepo.update(entity)).rejects.toThrow(new NotFoundError(entity.id.value, Genre));
  });

  it('should update a entity', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake().aGenre().addCategoryId(categories[0].id).build();
    await genreRepo.insert(genre);

    genre.changeName('Movie updated');
    genre.syncCategoriesId([categories[1].id]);

    await genreRepo.update(genre);

    let entityFound = await genreRepo.findById(genre.id);
    expect(genre.toJSON()).toStrictEqual(entityFound!.toJSON());
    await expect(GenreCategoryModel.count()).resolves.toBe(1);

    genre.addCategoryId(categories[0].id);
    await genreRepo.update(genre);

    entityFound = await genreRepo.findById(genre.id);
    expect(genre.toJSON()).toStrictEqual({
      ...entityFound!.toJSON(),
      categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value]),
    });
  });

  it('should throw error on delete when a entity not found', async () => {
    const genreId = new GenreId();
    await expect(genreRepo.delete(genreId)).rejects.toThrow(new NotFoundError(genreId.value, Genre));

    await expect(genreRepo.delete(new GenreId('9366b7dc-2d71-4799-b91c-c64adb205104'))).rejects.toThrow(
      new NotFoundError('9366b7dc-2d71-4799-b91c-c64adb205104', Genre),
    );
  });

  it('should delete a entity', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepo.insert(genre);

    await genreRepo.delete(genre.id);
    const genreFound = await GenreModel.findByPk(genre.id.value);
    expect(genreFound).toBeNull();
    await expect(GenreCategoryModel.count()).resolves.toBe(0);
  });

  describe('search method tests', () => {
    it('should order by created_at DESC when search params are null', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepo.bulkInsert(categories);
      const genres = Genre.fake()
        .theGenres(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .build();
      await genreRepo.bulkInsert(genres);
      const spyToEntity = jest.spyOn(GenreModelMapper, 'toEntity');
      const searchOutput = await genreRepo.search(GenreSearchParams.create());
      expect(searchOutput).toBeInstanceOf(GenreSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });

      [...genres.slice(1, 16)].reverse().forEach((item, index) => {
        expect(searchOutput.items[index]).toBeInstanceOf(Genre);
        const expected = searchOutput.items[index].toJSON();
        expect(item.toJSON()).toStrictEqual({
          ...expected,
          categories_id: expect.arrayContaining([
            categories[0].id.value,
            categories[1].id.value,
            categories[2].id.value,
          ]),
        });
      });
    });

    it('should apply paginate and filter by name', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepo.bulkInsert(categories);
      const genres = [
        Genre.fake()
          .aGenre()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      let searchOutput = await genreRepo.search(
        GenreSearchParams.create({
          page: 1,
          per_page: 2,
          filter: { name: 'TEST' },
        }),
      );

      let expected = new GenreSearchResult({
        items: [genres[0], genres[2]],
        total: 3,
        current_page: 1,
        per_page: 2,
      }).toJSON(true);
      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categories_id: expect.arrayContaining([
              categories[0].id.value,
              categories[1].id.value,
              categories[2].id.value,
            ]),
          },
          {
            ...expected.items[1],
            categories_id: expect.arrayContaining([
              categories[0].id.value,
              categories[1].id.value,
              categories[2].id.value,
            ]),
          },
        ],
      });

      expected = new GenreSearchResult({
        items: [genres[3]],
        total: 3,
        current_page: 2,
        per_page: 2,
      }).toJSON(true);
      searchOutput = await genreRepo.search(
        GenreSearchParams.create({
          page: 2,
          per_page: 2,
          filter: { name: 'TEST' },
        }),
      );
      expect(searchOutput.toJSON(true)).toMatchObject({
        ...expected,
        items: [
          {
            ...expected.items[0],
            categories_id: expect.arrayContaining([
              categories[0].id.value,
              categories[1].id.value,
              categories[2].id.value,
            ]),
          },
        ],
      });
    });

    it('should apply paginate and filter by categories_id', async () => {
      const categories = Category.fake().theCategories(4).build();
      await categoryRepo.bulkInsert(categories);
      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .withCreatedAt(new Date(new Date().getTime() + 2000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[3].id)
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      const arrange = [
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: { categories_id: [categories[0].id.value] },
          }),
          result: {
            items: [genres[2], genres[1]],
            total: 3,
            current_page: 1,
            per_page: 2,
          },
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            filter: { categories_id: [categories[0].id.value] },
          }),
          result: {
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          },
        },
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            filter: {
              categories_id: [categories[0].id.value, categories[1].id.value],
            },
          }),
          result: {
            items: [genres[4], genres[2]],
            total: 4,
            current_page: 1,
            per_page: 2,
          },
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            filter: {
              categories_id: [categories[0].id.value, categories[1].id.value],
            },
          }),
          result: {
            items: [genres[1], genres[0]],
            total: 4,
            current_page: 2,
            per_page: 2,
          },
        },
      ];
      for (const arrangeItem of arrange) {
        const searchOutput = await genreRepo.search(arrangeItem.params);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { items, ...otherOutput } = searchOutput;
        const { items: itemsExpected, ...otherExpected } = arrangeItem.result;
        expect(otherOutput).toMatchObject(otherExpected);
        expect(searchOutput.items.length).toBe(itemsExpected.length);
        searchOutput.items.forEach((item, key) => {
          const expected = itemsExpected[key].toJSON();
          expect(item.toJSON()).toStrictEqual(
            expect.objectContaining({
              ...expected,
              categories_id: expect.arrayContaining(expected.categories_id),
            }),
          );
        });
      }
    });

    it('should apply paginate and sort', async () => {
      expect(genreRepo.sortableFields).toStrictEqual(['name', 'created_at']);

      const categories = Category.fake().theCategories(4).build();
      await categoryRepo.bulkInsert(categories);
      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('b')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('d')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('c')
          .build(),
      ];
      await genreRepo.bulkInsert(genres);

      const arrange = [
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
          }),
          result: new GenreSearchResult({
            items: [genres[1], genres[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new GenreSearchResult({
            items: [genres[3], genres[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new GenreSearchResult({
            items: [genres[4], genres[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await genreRepo.search(i.params);
        const expected = i.result.toJSON(true);

        expect(result.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      }
    });

    describe('should search using filter by name, sort and paginate', () => {
      const categories = Category.fake().theCategories(3).build();

      const genres = [
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('test')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('a')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('TEST')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('e')
          .build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('TeSt')
          .build(),
      ];

      const arrange = [
        {
          search_params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          search_result: new GenreSearchResult({
            items: [genres[2], genres[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          search_result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      test.each(arrange)('when value is $search_params', async ({ search_params, search_result: expected_result }) => {
        const result = await genreRepo.search(search_params);
        const expected = expected_result.toJSON(true);
        expect(result.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      });
    });

    describe('should search using filter by categories_id, sort and paginate', () => {
      const categories = Category.fake().theCategories(4).build();

      const genres = [
        Genre.fake().aGenre().addCategoryId(categories[0].id).withName('test').build(),
        Genre.fake().aGenre().addCategoryId(categories[0].id).addCategoryId(categories[1].id).withName('a').build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('TEST')
          .build(),
        Genre.fake().aGenre().addCategoryId(categories[3].id).withName('e').build(),
        Genre.fake().aGenre().addCategoryId(categories[1].id).addCategoryId(categories[2].id).withName('TeSt').build(),
      ];

      const arrange = [
        {
          search_params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: { categories_id: [categories[0].id.value] },
          }),
          search_result: new GenreSearchResult({
            items: [genres[2], genres[1]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: { categories_id: [categories[0].id.value] },
          }),
          search_result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      test.each(arrange)('when value is $search_params', async ({ search_params, search_result: expected_result }) => {
        const result = await genreRepo.search(search_params);
        const expected = expected_result.toJSON(true);
        expect(result.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      });
    });

    describe('should search using filter by name and categories_id, sort and paginate', () => {
      const categories = Category.fake().theCategories(4).build();

      const genres = [
        Genre.fake().aGenre().addCategoryId(categories[0].id).addCategoryId(categories[1].id).withName('test').build(),
        Genre.fake().aGenre().addCategoryId(categories[0].id).addCategoryId(categories[1].id).withName('a').build(),
        Genre.fake()
          .aGenre()
          .addCategoryId(categories[0].id)
          .addCategoryId(categories[1].id)
          .addCategoryId(categories[2].id)
          .withName('TEST')
          .build(),
        Genre.fake().aGenre().addCategoryId(categories[3].id).withName('e').build(),
        Genre.fake().aGenre().addCategoryId(categories[1].id).addCategoryId(categories[2].id).withName('TeSt').build(),
      ];

      const arrange = [
        {
          search_params: GenreSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
              categories_id: [categories[1].id],
            },
          }),
          search_result: new GenreSearchResult({
            items: [genres[2], genres[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: GenreSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
              categories_id: [categories[1].id],
            },
          }),
          search_result: new GenreSearchResult({
            items: [genres[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await categoryRepo.bulkInsert(categories);
        await genreRepo.bulkInsert(genres);
      });

      test.each(arrange)('when value is $search_params', async ({ search_params, search_result: expected_result }) => {
        const result = await genreRepo.search(search_params);
        const expected = expected_result.toJSON(true);
        expect(result.toJSON(true)).toMatchObject({
          ...expected,
          items: expected.items.map((i) => ({
            ...i,
            categories_id: expect.arrayContaining(i.categories_id),
          })),
        });
      });
    });
  });
});
