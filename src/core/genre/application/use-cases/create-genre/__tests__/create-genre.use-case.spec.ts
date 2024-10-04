import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { CreateGenreUseCase } from '@/core/genre/application/use-cases/create-genre/create-genre.use-case';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';

describe('CreateGenreUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let categoriesIdExistsInDatabase: CategoriesIdExistsInDatabaseValidator;
  let useCase: CreateGenreUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoriesIdExistsInDatabase = new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    useCase = new CreateGenreUseCase(uow, genreRepository, categoryRepository, categoriesIdExistsInDatabase);
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories id not exists', async () => {
      expect.assertions(3);
      const spyValidateCategoriesId = jest.spyOn(categoriesIdExistsInDatabase, 'validate');
      try {
        await useCase.execute({
          name: 'test',
          categories_id: ['4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a', '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a'],
        });
        //valid uuid - 7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
        ]);
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.errors).toStrictEqual([
          {
            categories_id: [
              'Entity Category with id 4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a not found',
              'Entity Category with id 7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a not found',
            ],
          },
        ]);
      }
    });

    it('should create a genre', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepository.bulkInsert([category1, category2]);
      const spyInsert = jest.spyOn(genreRepository, 'insert');
      const spyUowDo = jest.spyOn(uow, 'do');
      let output = await useCase.execute({
        name: 'test',
        categories_id: [category1.id.value, category2.id.value],
      });
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: genreRepository.items[0].id.value,
        name: 'test',
        categories: [category1, category2].map((e) => ({
          id: e.id.value,
          name: e.name,
          created_at: e.created_at,
        })),
        categories_id: [category1.id.value, category2.id.value],
        is_active: true,
        created_at: genreRepository.items[0].created_at,
      });

      output = await useCase.execute({
        name: 'test',
        categories_id: [category1.id.value, category2.id.value],
        is_active: false,
      });
      expect(spyInsert).toHaveBeenCalledTimes(2);
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({
        id: genreRepository.items[1].id.value,
        name: 'test',
        categories_id: [category1.id.value, category2.id.value],
        categories: [category1, category2].map((e) => ({
          id: e.id.value,
          name: e.name,
          created_at: e.created_at,
        })),
        is_active: false,
        created_at: genreRepository.items[1].created_at,
      });
    });
  });
});
