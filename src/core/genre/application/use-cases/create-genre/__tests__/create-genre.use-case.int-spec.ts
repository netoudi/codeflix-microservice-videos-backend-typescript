import { DatabaseError } from 'sequelize';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { GenreId, Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel, GenreCategoryModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CreateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator;
  let useCase: CreateGenreUseCase;

  const sequelizeHelper = setupSequelize({ models: [GenreModel, GenreCategoryModel, CategoryModel] });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    categoriesIdExistsInDatabase = new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    useCase = new CreateGenreUseCase(uow, genreRepository, categoryRepository, categoriesIdExistsInDatabase);
  });

  it('should create a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.id.value);

    let output = await useCase.execute({
      name: 'test genre',
      categories_id: categoriesId,
    });

    let entity = await genreRepository.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: entity!.id.value,
      name: 'test genre',
      categories: expect.arrayContaining(
        categories.map((e) => ({
          id: e.id.value,
          name: e.name,
          created_at: e.created_at,
        })),
      ),
      categories_id: expect.arrayContaining(categoriesId),
      is_active: true,
      created_at: entity!.created_at,
    });

    output = await useCase.execute({
      name: 'test genre',
      categories_id: [categories[0].id.value],
      is_active: true,
    });

    entity = await genreRepository.findById(new GenreId(output.id));
    expect(output).toStrictEqual({
      id: entity!.id.value,
      name: 'test genre',
      categories: expect.arrayContaining(
        [categories[0]].map((e) => ({
          id: e.id.value,
          name: e.name,
          created_at: e.created_at,
        })),
      ),
      categories_id: expect.arrayContaining([categories[0].id.value]),
      is_active: true,
      created_at: entity!.created_at,
    });
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const categoriesId = categories.map((c) => c.id.value);

    const genre = Genre.fake().aGenre().build();
    genre.name = 't'.repeat(256);

    const mockCreate = jest.spyOn(Genre, 'create').mockImplementation(() => genre);

    await expect(
      useCase.execute({
        name: 'test genre',
        categories_id: categoriesId,
      }),
    ).rejects.toThrow(DatabaseError);

    const genres = await genreRepository.findAll();
    expect(genres.length).toEqual(0);

    mockCreate.mockRestore();
  });
});
