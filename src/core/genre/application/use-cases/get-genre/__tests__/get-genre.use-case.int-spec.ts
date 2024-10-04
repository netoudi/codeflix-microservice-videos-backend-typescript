import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { GenreId, Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel, GenreCategoryModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('GetGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let useCase: GetGenreUseCase;

  const sequelizeHelper = setupSequelize({ models: [GenreModel, GenreCategoryModel, CategoryModel] });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetGenreUseCase(genreRepository, categoryRepository);
  });

  it('should throw error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() => useCase.execute({ id: genreId.value })).rejects.toThrow(new NotFoundError(genreId.value, Genre));
  });

  it('should return a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genre = Genre.fake().aGenre().addCategoryId(categories[0].id).addCategoryId(categories[1].id).build();
    await genreRepository.insert(genre);
    const output = await useCase.execute({ id: genre.id.value });
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      categories: expect.arrayContaining([
        expect.objectContaining({
          id: categories[0].id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        }),
        expect.objectContaining({
          id: categories[1].id.value,
          name: categories[1].name,
          created_at: categories[1].created_at,
        }),
      ]),
      categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value]),
      is_active: true,
      created_at: genre.created_at,
    });
  });
});
