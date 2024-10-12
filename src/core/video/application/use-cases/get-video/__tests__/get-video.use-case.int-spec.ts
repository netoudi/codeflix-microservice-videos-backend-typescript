import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { GetVideoUseCase } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@/core/video/infra/db/sequelize/video.model';

describe('GetVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;
  let useCase: GetVideoUseCase;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new GetVideoUseCase(videoRepository, categoryRepository, genreRepository, castMemberRepository);
  });

  it('should throw error when entity not found', async () => {
    const videoId = new VideoId();
    await expect(() => useCase.execute({ id: videoId.value })).rejects.toThrow(new NotFoundError(videoId.value, Video));
  });

  it('should return a video', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[1].syncCategoriesId([categories[1].id]);
    await genreRepository.bulkInsert(genres);
    const cast_members = CastMember.fake().theCastMembers(2).build();
    await castMemberRepository.bulkInsert(cast_members);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addGenreId(genres[0].id)
      .addGenreId(genres[1].id)
      .addCastMemberId(cast_members[0].id)
      .addCastMemberId(cast_members[1].id)
      .build();
    await videoRepository.insert(video);
    const output = await useCase.execute({ id: video.id.value });
    expect(output).toStrictEqual({
      id: video.id.value,
      title: video.title,
      description: video.description,
      year_launched: video.year_launched,
      duration: video.duration,
      rating: video.rating.value,
      is_opened: video.is_opened,
      is_published: video.is_published,
      categories: expect.arrayContaining([
        {
          id: categories[0].id.value,
          name: categories[0].name,
          created_at: categories[0].created_at,
        },
        {
          id: categories[1].id.value,
          name: categories[1].name,
          created_at: categories[1].created_at,
        },
      ]),
      categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value]),
      genres: expect.arrayContaining([
        {
          id: genres[0].id.value,
          name: genres[0].name,
          created_at: genres[0].created_at,
        },
        {
          id: genres[1].id.value,
          name: genres[1].name,
          created_at: genres[1].created_at,
        },
      ]),
      genres_id: expect.arrayContaining([genres[0].id.value, genres[1].id.value]),
      cast_members: expect.arrayContaining([
        {
          id: cast_members[0].id.value,
          name: cast_members[0].name,
          created_at: cast_members[0].created_at,
        },
        {
          id: cast_members[1].id.value,
          name: cast_members[1].name,
          created_at: cast_members[1].created_at,
        },
      ]),
      cast_members_id: expect.arrayContaining([cast_members[0].id.value, cast_members[1].id.value]),
      created_at: video.created_at,
    });
  });
});
