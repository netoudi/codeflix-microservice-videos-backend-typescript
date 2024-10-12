import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { Category } from '@/core/category/domain/category.entity';
import { CategorySequelizeRepository } from '@/core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@/core/category/infra/db/sequelize/category.model';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSequelizeRepository } from '@/core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@/core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@/core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { ListVideosUseCase } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { Video } from '@/core/video/domain/video.aggregate';
import { setupSequelizeForVideo } from '@/core/video/infra/db/sequelize/testing/helpers';
import { VideoSequelizeRepository } from '@/core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '@/core/video/infra/db/sequelize/video.model';

describe('ListVideosUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let videoRepository: VideoSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let castMemberRepository: CastMemberSequelizeRepository;
  let useCase: ListVideosUseCase;

  const sequelizeHelper = setupSequelizeForVideo();

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    videoRepository = new VideoSequelizeRepository(VideoModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    castMemberRepository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListVideosUseCase(videoRepository, categoryRepository, genreRepository, castMemberRepository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[0].syncCategoriesId([categories[1].id]);
    genres[1].syncCategoriesId([categories[2].id]);
    await genreRepository.bulkInsert(genres);

    const cast_members = CastMember.fake().theCastMembers(2).build();
    await castMemberRepository.bulkInsert(cast_members);

    const videos = Video.fake()
      .theVideosWithoutMedias(16)
      .withCreatedAt((index) => new Date(new Date().getTime() + 1000 + index))
      .addCategoryId(categories[0].id)
      .addCategoryId(categories[1].id)
      .addCategoryId(categories[2].id)
      .addGenreId(genres[0].id)
      .addGenreId(genres[1].id)
      .addCastMemberId(cast_members[0].id)
      .addCastMemberId(cast_members[1].id)
      .build();
    await videoRepository.bulkInsert(videos);
    const output = await useCase.execute({});
    expect(output).toEqual({
      items: [...videos]
        .reverse()
        .slice(0, 15)
        .map((i) => formatOutput(i, categories, genres, cast_members)),
      total: 16,
      current_page: 1,
      last_page: 2,
      per_page: 15,
    });
  });

  describe('should search applying filter by title, sort and paginate', () => {
    const categories = Category.fake().theCategories(3).build();

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[0].syncCategoriesId([categories[1].id]);
    genres[1].syncCategoriesId([categories[2].id]);

    const cast_members = CastMember.fake().theCastMembers(2).build();

    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test')
        .withCreatedAt(new Date(new Date().getTime() + 4000))
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('a')
        .withCreatedAt(new Date(new Date().getTime() + 3000))
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TEST')
        .withCreatedAt(new Date(new Date().getTime() + 2000))
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TeSt')
        .withCreatedAt(new Date(new Date().getTime() + 1000))
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: { title: 'TEST' },
        },
        output: {
          items: [videos[2], videos[3]].map((i) => formatOutput(i, categories, genres, cast_members)),
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'title',
          filter: { title: 'TEST' },
        },
        output: {
          items: [videos[0]].map((i) => formatOutput(i, categories, genres, cast_members)),
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
      await castMemberRepository.bulkInsert(cast_members);
      await videoRepository.bulkInsert(videos);
    });

    test.each(arrange)('when value is $search_params', async ({ input, output: expectedOutput }) => {
      const output = await useCase.execute(input);
      expect(output).toEqual(expectedOutput);
    });
  });

  describe('should search applying filter by categories_id, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[0].syncCategoriesId([categories[1].id]);
    genres[1].syncCategoriesId([categories[2].id]);
    genres[1].syncCategoriesId([categories[3].id]);

    const cast_members = CastMember.fake().theCastMembers(2).build();

    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('test')
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withTitle('a')
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .withTitle('TEST')
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[3].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('e')
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .withTitle('TeSt')
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [
            formatOutput(videos[2], [categories[0], categories[1], categories[2]], genres, cast_members),
            formatOutput(videos[1], [categories[0], categories[1]], genres, cast_members),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'title',
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [formatOutput(videos[0], [categories[0]], genres, cast_members)],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
      await castMemberRepository.bulkInsert(cast_members);
      await videoRepository.bulkInsert(videos);
    });

    test.each(arrange)('when value is $search_params', async ({ input, output: expectedOutput }) => {
      const output = await useCase.execute(input);
      expect(output).toEqual(expectedOutput);
    });
  });

  describe('should search using filter by title and categories_id, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = Genre.fake().theGenres(2).build();
    genres[0].syncCategoriesId([categories[0].id]);
    genres[0].syncCategoriesId([categories[1].id]);
    genres[1].syncCategoriesId([categories[2].id]);
    genres[1].syncCategoriesId([categories[3].id]);

    const cast_members = CastMember.fake().theCastMembers(2).build();

    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('test')
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('a')
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('TEST')
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[3].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('e')
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addGenreId(genres[1].id)
        .addCastMemberId(cast_members[0].id)
        .addCastMemberId(cast_members[1].id)
        .withTitle('TeSt')
        .build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: {
            title: 'TEST',
            categories_id: [categories[1].id.value],
          },
        },
        output: {
          items: [
            formatOutput(videos[2], [categories[0], categories[1], categories[2]], genres, cast_members),
            formatOutput(videos[4], [categories[1], categories[2]], genres, cast_members),
          ],
          total: 3,
          current_page: 1,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'title',
          filter: {
            title: 'TEST',
            categories_id: [categories[1].id.value],
          },
        },
        output: {
          items: [formatOutput(videos[0], [categories[0]], genres, cast_members)],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await genreRepository.bulkInsert(genres);
      await castMemberRepository.bulkInsert(cast_members);
      await videoRepository.bulkInsert(videos);
    });

    test.each(arrange)('when value is $search_params', async ({ input, output: expectedOutput }) => {
      const output = await useCase.execute(input);
      expect(output).toEqual(expectedOutput);
    });
  });
});

function formatOutput(video: Video, categories: Category[], genres: Genre[], cast_members: CastMember[]) {
  const output = VideoOutputMapper.toOutput(video, categories, genres, cast_members);
  return {
    ...output,
    categories: expect.arrayContaining(output.categories.map((c) => expect.objectContaining(c))),
    categories_id: expect.arrayContaining(output.categories_id),
    genres: expect.arrayContaining(output.genres.map((c) => expect.objectContaining(c))),
    genres_id: expect.arrayContaining(output.genres_id),
    cast_members: expect.arrayContaining(output.cast_members.map((c) => expect.objectContaining(c))),
    cast_members_id: expect.arrayContaining(output.cast_members_id),
  };
}
