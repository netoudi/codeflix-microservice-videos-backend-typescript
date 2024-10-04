import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel, GenreCategoryModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('ListGenresUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let useCase: ListGenresUseCase;

  const sequelizeHelper = setupSequelize({ models: [GenreModel, GenreCategoryModel, CategoryModel] });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListGenresUseCase(genreRepository, categoryRepository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const genres = Genre.fake()
      .theGenres(16)
      .withCreatedAt((index) => new Date(new Date().getTime() + 1000 + index))
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addCategoryId(categories[2].id)
      .build();
    await genreRepository.bulkInsert(genres);
    const output = await useCase.execute({});
    expect(output).toEqual({
      items: [...genres]
        .reverse()
        .slice(0, 15)
        .map((i) => formatOutput(i, categories)),
      total: 16,
      current_page: 1,
      last_page: 2,
      per_page: 15,
    });
  });

  describe('should search applying filter by name, sort and paginate', () => {
    const categories = Category.fake().theCategories(3).build();
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

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [genres[2], genres[3]].map((i) => formatOutput(i, categories)),
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [genres[0]].map((i) => formatOutput(i, categories)),
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)('when value is $search_params', async ({ input, output: expectedOutput }) => {
      const output = await useCase.execute(input);
      expect(output).toEqual(expectedOutput);
    });
  });

  describe('should search applying filter by categories_id, sort and paginate', () => {
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
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [
            formatOutput(genres[2], [categories[0], categories[1], categories[2]]),
            formatOutput(genres[1], [categories[0], categories[1]]),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'name',
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [formatOutput(genres[0], [categories[0]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)('when value is $search_params', async ({ input, output: expectedOutput }) => {
      const output = await useCase.execute(input);
      expect(output).toEqual(expectedOutput);
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
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categories_id: [categories[1].id.value],
          },
        },
        output: {
          items: [
            formatOutput(genres[2], [categories[0], categories[1], categories[2]]),
            formatOutput(genres[4], [categories[1], categories[2]]),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categories_id: [categories[1].id.value],
          },
        },
        output: {
          items: [formatOutput(genres[0], [categories[0]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)('when value is $search_params', async ({ input, output: expectedOutput }) => {
      const output = await useCase.execute(input);
      expect(output).toEqual(expectedOutput);
    });
  });
});

function formatOutput(genre, categories) {
  const output = GenreOutputMapper.toOutput(genre, categories);
  return {
    ...output,
    categories: expect.arrayContaining(output.categories.map((c) => expect.objectContaining(c))),
    categories_id: expect.arrayContaining(output.categories_id),
  };
}
