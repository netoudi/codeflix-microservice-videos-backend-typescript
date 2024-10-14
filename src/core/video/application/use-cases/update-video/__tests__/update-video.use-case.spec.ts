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
import { UpdateVideoInput } from '@/core/video/application/use-cases/update-video/update-video.input';
import { UpdateVideoUseCase } from '@/core/video/application/use-cases/update-video/update-video.use-case';
import { Rating } from '@/core/video/domain/rating.vo';
import { Video } from '@/core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('UpdateVideoUseCase Unit Tests', () => {
  let uow: FakeUnitOfWorkInMemory;

  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;

  let categoriesIdValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdValidator: CastMembersIdExistsInDatabaseValidator;

  let useCase: UpdateVideoUseCase;

  beforeEach(() => {
    uow = new FakeUnitOfWorkInMemory();

    videoRepository = new VideoInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    castMemberRepository = new CastMemberInMemoryRepository();

    categoriesIdValidator = new CategoriesIdExistsInDatabaseValidator(categoryRepository);
    genresIdValidator = new GenresIdExistsInDatabaseValidator(genreRepository);
    castMembersIdValidator = new CastMembersIdExistsInDatabaseValidator(castMemberRepository);

    useCase = new UpdateVideoUseCase(
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
      const video = Video.fake().aVideoWithoutMedias().build();
      await videoRepository.insert(video);
      const spyValidateCategoriesId = jest.spyOn(categoriesIdValidator, 'validate');
      const spyValidateGenresId = jest.spyOn(genresIdValidator, 'validate');
      const spyValidateCastMembersId = jest.spyOn(castMembersIdValidator, 'validate');
      try {
        await useCase.execute(
          new UpdateVideoInput({
            id: video.id.value,
            categories_id: ['4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a', '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a'],
            genres_id: ['4642a694-aa66-46b4-a142-2ae1d9a95d68', '65344b22-fd32-4866-9087-93fd10f81e49'],
            cast_members_id: ['4183cb07-60b5-49f8-adc9-a4c9ebdda595', 'adcacf98-a344-4c90-b7f8-4500b2c6a6e7'],
          }),
        );
      } catch (e) {
        expect(spyValidateCategoriesId).toHaveBeenCalledWith([
          '4f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
          '7f7e1c30-3f7a-4f51-9f4a-3e9c4c8f1a1a',
        ]);
        expect(spyValidateGenresId).toHaveBeenCalledWith([
          '4642a694-aa66-46b4-a142-2ae1d9a95d68',
          '65344b22-fd32-4866-9087-93fd10f81e49',
        ]);
        expect(spyValidateCastMembersId).toHaveBeenCalledWith([
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

    it('should update a video', async () => {
      const categories = Category.fake().theCategories(2).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake().theGenres(2).build();
      genres[0].syncCategoriesId([categories[0].id]);
      genres[1].syncCategoriesId([categories[1].id]);
      await genreRepository.bulkInsert(genres);

      const cast_members = CastMember.fake().theCastMembers(2).build();
      await castMemberRepository.bulkInsert(cast_members);

      const categoriesId = categories.map((i) => i.id);
      const genresId = genres.map((i) => i.id);
      const castMembersId = cast_members.map((i) => i.id);

      const video = Video.fake().aVideoWithoutMedias().build();
      video.syncCategoriesId(categoriesId);
      video.syncGenresId(genresId);
      video.syncCastMembersId(castMembersId);
      await videoRepository.insert(video);

      const spyUpdate = jest.spyOn(videoRepository, 'update');
      const spyUowDo = jest.spyOn(uow, 'do');

      await useCase.execute(
        new UpdateVideoInput({
          id: video.id.value,
          categories_id: [categoriesId[0].value],
          genres_id: [genresId[0].value],
          cast_members_id: [castMembersId[0].value],
        }),
      );
      expect(spyUowDo).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      const output1 = await videoRepository.findById(video.id);
      expect(output1?.toJSON()).toStrictEqual({
        id: video.id.value,
        title: video.title,
        description: video.description,
        year_launched: video.year_launched,
        duration: video.duration,
        rating: video.rating.value,
        is_opened: video.is_opened,
        is_published: video.is_published,
        banner: null,
        thumbnail: null,
        thumbnail_half: null,
        trailer: null,
        video: null,
        categories_id: [categoriesId[0].value],
        genres_id: [genresId[0].value],
        cast_members_id: [castMembersId[0].value],
        created_at: expect.any(Date),
      });

      await useCase.execute(
        new UpdateVideoInput({
          id: video.id.value,
          title: 'title updated',
          description: 'description updated',
          year_launched: 1998,
          duration: 99,
          rating: Rating.createR18().value,
          is_opened: false,
          categories_id: [categoriesId[1].value],
          genres_id: [genresId[1].value],
          cast_members_id: [castMembersId[1].value],
        }),
      );
      expect(spyUowDo).toHaveBeenCalledTimes(2);
      expect(spyUpdate).toHaveBeenCalledTimes(2);
      const output2 = await videoRepository.findById(video.id);
      expect(output2?.toJSON()).toStrictEqual({
        id: video.id.value,
        title: 'title updated',
        description: 'description updated',
        year_launched: 1998,
        duration: 99,
        rating: '18',
        is_opened: false,
        is_published: false,
        banner: null,
        thumbnail: null,
        thumbnail_half: null,
        trailer: null,
        video: null,
        categories_id: [categoriesId[1].value],
        genres_id: [genresId[1].value],
        cast_members_id: [castMembersId[1].value],
        created_at: expect.any(Date),
      });
    });
  });
});
