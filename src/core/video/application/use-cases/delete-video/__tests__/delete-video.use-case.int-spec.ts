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
import { DeleteVideoUseCase } from '@/core/video/application/use-cases/delete-video/delete-video.use-case';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@/core/video/infra/db/sequelize/video.model';

describe('DeleteVideoUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;
  let useCase: DeleteVideoUseCase;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteVideoUseCase(uow, videoRepository);
  });

  it('should throw error when entity not found', async () => {
    const videoId = new VideoId();
    await expect(() => useCase.execute({ id: videoId.value })).rejects.toThrow(new NotFoundError(videoId.value, Video));
  });

  it('should delete a video', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[1].syncCategoriesId([categories[1].id]);
    await genreRepository.bulkInsert(genres);
    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepository.bulkInsert(castMembers);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addGenreId(genres[0].id)
      .addGenreId(genres[1].id)
      .addCastMemberId(castMembers[0].id)
      .addCastMemberId(castMembers[1].id)
      .build();
    await videoRepository.insert(video);
    expect(true).toBeTruthy();
    await useCase.execute({
      id: video.id.value,
    });
    await expect(videoRepository.findById(video.id)).resolves.toBeNull();
  });

  it('rollback transaction', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepository.bulkInsert(categories);
    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[1].syncCategoriesId([categories[1].id]);
    await genreRepository.bulkInsert(genres);
    const castMembers = CastMember.fake().theCastMembers(2).build();
    await castMemberRepository.bulkInsert(castMembers);
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addGenreId(genres[0].id)
      .addGenreId(genres[1].id)
      .addCastMemberId(castMembers[0].id)
      .addCastMemberId(castMembers[1].id)
      .build();
    await videoRepository.insert(video);

    VideoModel.afterBulkDestroy('hook-test', () => {
      return Promise.reject(new Error('Generic Error'));
    });

    await expect(
      useCase.execute({
        id: video.id.value,
      }),
    ).rejects.toThrow('Generic Error');

    VideoModel.removeHook('afterBulkDestroy', 'hook-test');

    const videos = await videoRepository.findAll();
    expect(videos.length).toEqual(1);
  });
});
