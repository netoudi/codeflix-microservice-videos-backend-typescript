import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { GetGenreUseCase } from '@/core/genre/application/use-cases/get-genre/get-genre.use-case';
import { GenreId, Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';

describe('GetGenreUseCase Unit Tests', () => {
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let useCase: GetGenreUseCase;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    useCase = new GetGenreUseCase(genreRepository, categoryRepository);
  });

  it('should throw error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() => useCase.execute({ id: genreId.value })).rejects.toThrow(new NotFoundError(genreId.value, Genre));
  });

  it('should return a genre', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const genre = Genre.fake().aGenre().addCategoryId(categories[0].id).addCategoryId(categories[2].id).build();
    genreRepository.items = [genre];
    const spyGenreFindById = jest.spyOn(genreRepository, 'findById');
    const spyCategoryFindByIds = jest.spyOn(categoryRepository, 'findByIds');
    const output = await useCase.execute({ id: genre.id.value });
    expect(spyGenreFindById).toHaveBeenCalledTimes(1);
    expect(spyCategoryFindByIds).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: genre.id.value,
      name: genre.name,
      categories: [
        {
          id: categories[0].id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[2].id.value,
          name: categories[2].name,
          created_at: categories[2].created_at,
        },
      ],
      categories_id: [...genre.categories_id.keys()],
      is_active: true,
      created_at: genre.created_at,
    });
  });
});
