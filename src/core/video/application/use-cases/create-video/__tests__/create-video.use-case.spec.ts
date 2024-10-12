import { CastMembersIdExistsInDatabaseValidator } from '@/core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { FakeUnitOfWorkInMemory } from '@/core/shared/infra/db/in-memory/fake-unit-of-work-in-memory';
import { CreateVideoUseCase } from '@/core/video/application/use-cases/create-video/create-video.use-case';
import { Rating } from '@/core/video/domain/rating.vo';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('CreateVideoUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;

  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;

  let categoriesIdValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdValidator: CastMembersIdExistsInDatabaseValidator;

  let useCase: CreateVideoUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();

    videoRepository = new VideoInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    castMemberRepository = new CastMemberInMemoryRepository();

    categoriesIdValidator = new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    genresIdValidator = new GenresIdExistsInDatabaseValidator(genreRepository);
    castMembersIdValidator = new CastMembersIdExistsInDatabaseValidator(castMemberRepository);

    useCase = new CreateVideoUseCase(
      uow,
      videoRepository,
      categoriesIdValidator,
      genresIdValidator,
      castMembersIdValidator,
    );
  });

  describe('execute method', () => {
    it('should throw an entity validation error when categories_id, genres_id and cast_members_id not exists', async () => {
      expect.assertions(5);
      const spyValidateCategoriesId = jest.spyOn(categoriesIdValidator, 'validate');
      const spyValidateGenresId = jest.spyOn(genresIdValidator, 'validate');
      const spyValidateCastMemberId = jest.spyOn(castMembersIdValidator, 'validate');
      try {
        await useCase.execute({
          title: 'test',
          description: '',
          year_launched: 0,
          duration: 0,
          rating: Rating.createR10().value,
          is_opened: false,
          categories_id: ['4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a', '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a'],
          genres_id: ['4642a694-aa66-46b4-a142-2ae1d9a95d68', '65344b22-fd32-4866-9087-93fd10f81e49'],
          cast_members_id: ['4183cb07-60b5-49f8-adc9-a4c9ebdda595', 'adcacf98-a344-4c90-b7f8-4500b2c6a6e7'],
        });
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
        ]);
        expect(spyValidateGenresId).toHaveBeenCalledWith([
          '4642a694-aa66-46b4-a142-2ae1d9a95d68',
          '65344b22-fd32-4866-9087-93fd10f81e49',
        ]);
        expect(spyValidateCastMemberId).toHaveBeenCalledWith([
          '4183cb07-60b5-49f8-adc9-a4c9ebdda595',
          'adcacf98-a344-4c90-b7f8-4500b2c6a6e7',
        ]);
        expect(e).toBeInstanceOf(EntityValidationError);
        expect(e.errors).toStrictEqual([
          {
            categories_id: [
              'Entity Category with id 4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a not found',
              'Entity Category with id 7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a not found',
            ],
          },
          {
            genres_id: [
              'Entity Genre with id 4642a694-aa66-46b4-a142-2ae1d9a95d68 not found',
              'Entity Genre with id 65344b22-fd32-4866-9087-93fd10f81e49 not found',
            ],
          },
          {
            cast_members_id: [
              'Entity CastMember with id 4183cb07-60b5-49f8-adc9-a4c9ebdda595 not found',
              'Entity CastMember with id adcacf98-a344-4c90-b7f8-4500b2c6a6e7 not found',
            ],
          },
        ]);
      }
    });

    it('should create a video', async () => {
      const categories = Category.fake().theCategories(2).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake().theGenres(2).build();
      genres[0].syncCategoriesId([categories[0].id]);
      genres[1].syncCategoriesId([categories[1].id]);
      await genreRepository.bulkInsert(genres);

      const cast_members = CastMember.fake().theCastMembers(2).build();
      await castMemberRepository.bulkInsert(cast_members);

      const spyInsert = jest.spyOn(videoRepository, 'insert');
      const spyUowDo = jest.spyOn(uow, 'do');

      let output = await useCase.execute({
        title: 'test',
        description: '',
        year_launched: 0,
        duration: 0,
        rating: Rating.createR10().value,
        is_opened: true,
        categories_id: categories.map((i) => i.id.value),
        genres_id: genres.map((i) => i.id.value),
        cast_members_id: cast_members.map((i) => i.id.value),
      });
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({ id: videoRepository.items[0].id.value });

      output = await useCase.execute({
        title: 'test',
        description: '',
        year_launched: 0,
        duration: 0,
        rating: Rating.createR10().value,
        is_opened: true,
        categories_id: categories.map((i) => i.id.value),
        genres_id: genres.map((i) => i.id.value),
        cast_members_id: cast_members.map((i) => i.id.value),
      });
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(spyInsert).toHaveBeenCalledTimes(2);
      expect(output).toStrictEqual({ id: videoRepository.items[1].id.value });
    });
  });
});
