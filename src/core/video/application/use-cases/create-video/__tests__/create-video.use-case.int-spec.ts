import { DatabaseError } from 'sequelize';
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
import { CreateVideoUseCase } from '@/core/video/application/use-cases/create-video/create-video.use-case';
import { Rating } from '@/core/video/domain/rating.vo';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@/core/video/infra/db/sequelize/video.model';

describe('CreateVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;

  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;

  let categoriesIdValidator: CategoriesIdExistsInDatabaseValidator;
  let genresIdValidator: GenresIdExistsInDatabaseValidator;
  let castMembersIdValidator: CastMembersIdExistsInDatabaseValidator;

  let useCase: CreateVideoUseCase;

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

    useCase = new CreateVideoUseCase(
      uow,
      videoRepository,
      categoriesIdValidator,
      genresIdValidator,
      castMembersIdValidator,
    );
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

    const categoriesId = categories.map((i) => i.id.value);
    const genresId = genres.map((i) => i.id.value);
    const castMembersId = cast_members.map((i) => i.id.value);

    const output = await useCase.execute({
      title: 'test video',
      description: '',
      year_launched: 0,
      duration: 0,
      rating: Rating.createR10().value,
      is_opened: false,
      categories_id: categoriesId,
      genres_id: genresId,
      cast_members_id: castMembersId,
    });

    const entity = await videoRepository.findById(new VideoId(output.id));
    expect(entity?.toJSON()).toStrictEqual({
      id: output.id,
      title: 'test video',
      description: '',
      year_launched: 0,
      duration: 0,
      rating: '10',
      is_opened: false,
      is_published: false,
      banner: null,
      thumbnail: null,
      thumbnail_half: null,
      trailer: null,
      video: null,
      categories_id: expect.arrayContaining(categoriesId),
      genres_id: expect.arrayContaining(genresId),
      cast_members_id: expect.arrayContaining(castMembersId),
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

    const categoriesId = categories.map((i) => i.id.value);
    const genresId = genres.map((i) => i.id.value);
    const castMembersId = cast_members.map((i) => i.id.value);

    const video = Video.fake().aVideoWithoutMedias().build();
    video.title = 't'.repeat(256);

    const mockCreate = jest.spyOn(Video, 'create').mockImplementation(() => video);

    await expect(
      useCase.execute({
        title: 'test video',
        description: '',
        year_launched: 0,
        duration: 0,
        rating: Rating.createR10().value,
        is_opened: false,
        categories_id: categoriesId,
        genres_id: genresId,
        cast_members_id: castMembersId,
      }),
    ).rejects.toThrow(DatabaseError);

    const videos = await videoRepository.findAll();
    expect(videos.length).toEqual(0);

    mockCreate.mockRestore();
  });
});
