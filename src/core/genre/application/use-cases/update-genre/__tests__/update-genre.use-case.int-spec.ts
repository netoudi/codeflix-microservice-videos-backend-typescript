import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { UpdateGenreInput } from '@/core/genre/application/use-cases/update-genre/update-genre.input';
import {
  UpdateGenreUseCase,
  UpdateGenreOutput,
} from '@/core/genre/application/use-cases/update-genre/update-genre.use-case';
import { Genre, GenreId } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel, GenreCategoryModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('UpdateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator;
  let useCase: UpdateGenreUseCase;

  const sequelizeHelper = setupSequelize({ models: [GenreModel, GenreCategoryModel, CategoryModel] });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    categoriesIdExistsInDatabase = new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    useCase = new UpdateGenreUseCase(uow, genreRepository, categoryRepository, categoriesIdExistsInDatabase);
  });

  it('should update a genre', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const entity = Genre.fake().aGenre().addCategoryId(categories[1].id).build();
    await genreRepository.insert(entity);

    let output = await useCase.execute(
      new UpdateGenreInput({
        id: entity.id.value,
        name: 'test',
        categories_id: [categories[0].id.value],
      }),
    );
    expect(output).toStrictEqual({
      id: entity.id.value,
      name: 'test',
      categories: expect.arrayContaining(
        [categories[0]].map((e) => ({
          id: e.id.value,
          name: e.name,
          created_at: e.created_at,
        })),
      ),
      categories_id: expect.arrayContaining([categories[0].id.value]),
      is_active: true,
      created_at: entity.created_at,
    });

    type Arrange = {
      input: UpdateGenreInput;
      expected: UpdateGenreOutput;
    };

    const arrange: Arrange[] = [
      {
        input: {
          id: entity.id.value,
          categories_id: [categories[1].id.value, categories[2].id.value],
          is_active: true,
        },
        expected: {
          id: entity.id.value,
          name: 'test',
          categories: expect.arrayContaining(
            [categories[1], categories[2]].map((e) => ({
              id: e.id.value,
              name: e.name,
              created_at: e.created_at,
            })),
          ),
          categories_id: expect.arrayContaining([categories[1].id.value, categories[2].id.value]),
          is_active: true,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.id.value,
          name: 'test changed',
          categories_id: [categories[1].id.value, categories[2].id.value],
          is_active: false,
        },
        expected: {
          id: entity.id.value,
          name: 'test changed',
          categories: expect.arrayContaining(
            [categories[1], categories[2]].map((e) => ({
              id: e.id.value,
              name: e.name,
              created_at: e.created_at,
            })),
          ),
          categories_id: expect.arrayContaining([categories[1].id.value, categories[2].id.value]),
          is_active: false,
          created_at: entity.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute(i.input);
      const entityUpdated = await genreRepository.findById(new GenreId(i.input.id));
      expect(output).toStrictEqual({
        id: entity.id.value,
        name: i.expected.name,
        categories: i.expected.categories,
        categories_id: i.expected.categories_id,
        is_active: i.expected.is_active,
        created_at: i.expected.created_at,
      });
      expect(entityUpdated!.toJSON()).toStrictEqual({
        id: entity.id.value,
        name: i.expected.name,
        categories_id: i.expected.categories_id,
        is_active: i.expected.is_active,
        created_at: i.expected.created_at,
      });
    }
  });

  it('rollback transaction', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepository.insert(category);
    const entity = Genre.fake().aGenre().addCategoryId(category.id).build();
    await genreRepository.insert(entity);

    GenreModel.afterBulkUpdate('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute(
        new UpdateGenreInput({
          id: entity.id.value,
          name: 'test',
          categories_id: [category.id.value],
        }),
      ),
    ).rejects.toThrow(new Error('Generic Error'));

    GenreModel.removeHook('afterBulkUpdate', 'hook-test');

    const notUpdatedGenre = await genreRepository.findById(entity.id);
    expect(notUpdatedGenre!.name).toStrictEqual(entity.name);
  });
});
