import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { GetVideoUseCase } from '@/core/video/application/use-cases/get-video/get-video.use-case';
import { Video, VideoId } from '@/core/video/domain/video.aggregate';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('GetVideoUseCase Unit Tests', () => {
  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;
  let useCase: GetVideoUseCase;

  beforeEach(() => {
    categoryRepository = new CategoryInMemoryRepository();
    videoRepository = new VideoInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    castMemberRepository = new CastMemberInMemoryRepository();
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
    videoRepository.items = [video];
    const spyVideoFindById = jest.spyOn(videoRepository, 'findById');
    const spyCategoryFindByIds = jest.spyOn(categoryRepository, 'findByIds');
    const spyGenreFindByIds = jest.spyOn(genreRepository, 'findByIds');
    const spyCastMemberFindByIds = jest.spyOn(castMemberRepository, 'findByIds');
    const output = await useCase.execute({ id: video.id.value });
    expect(spyVideoFindById).toHaveBeenCalledTimes(1);
    expect(spyCategoryFindByIds).toHaveBeenCalledTimes(1);
    expect(spyGenreFindByIds).toHaveBeenCalledTimes(1);
    expect(spyCastMemberFindByIds).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: video.id.value,
      title: video.title,
      description: video.description,
      year_launched: video.year_launched,
      duration: video.duration,
      rating: video.rating.value,
      is_opened: video.is_opened,
      is_published: video.is_published,
      categories: [
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
      ],
      categories_id: [...video.categories_id.keys()],
      genres: [
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
      ],
      genres_id: [...video.genres_id.keys()],
      cast_members: [
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
      ],
      cast_members_id: [...video.cast_members_id.keys()],
      created_at: video.created_at,
    });
  });
});
