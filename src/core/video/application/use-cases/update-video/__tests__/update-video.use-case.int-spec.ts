import { CastMembersIdExistsInDatabaseValidator } from '@/core/cast-member/application/validations/cast-members-id-exists-in-database.validator';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { CategoriesIdExistsInDatabaseValidator } from '@/core/category/application/validations/categories-id-exists-in-database.validator';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { GenresIdExistsInDatabaseValidator } from '@/core/genre/application/validations/genres-id-exists-in-database.validator';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { UpdateVideoInput } from '@/core/video/application/use-cases/update-video/update-video.input';
import { UpdateVideoUseCase } from '@/core/video/application/use-cases/update-video/update-video.use-case';
import { Rating } from '@/core/video/domain/rating.vo';
import { Video } from '@/core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@/core/video/infra/db/sequelize/video.model';

describe('UpdateVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;

  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;

  let categoriesIdValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdValidator: CastMembersIdExistsInDatabaseValidator;

  let useCase: UpdateVideoUseCase;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);

    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);

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

  it('rollback transaction', async () => {
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

    VideoModel.afterBulkUpdate('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute(
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
      ),
    ).rejects.toThrow(new Error('Generic Error'));

    VideoModel.removeHook('afterBulkUpdate', 'hook-test');

    const notUpdatedVideo = await videoRepository.findById(video.id);
    expect(notUpdatedVideo!.title).toStrictEqual(video.title);
  });
});
