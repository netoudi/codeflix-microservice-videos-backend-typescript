import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { SortDirection } from '@/core/shared/domain/repository/search-params';
import { VideoOutputMapper } from '@/core/video/application/use-cases/common/video-output.mapper';
import { ListVideosUseCase } from '@/core/video/application/use-cases/list-video/list-videos.use-case';
import { Video } from '@/core/video/domain/video.aggregate';
import { VideoSearchResult } from '@/core/video/domain/video.repository';
import { VideoInMemoryRepository } from '@/core/video/infra/db/in-memory/video-in-memory.repository';

describe('ListVideosUseCase Unit Tests', () => {
  let videoRepository: VideoInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let castMemberRepository: CastMemberInMemoryRepository;
  let useCase: ListVideosUseCase;

  beforeEach(() => {
    videoRepository = new VideoInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    castMemberRepository = new CastMemberInMemoryRepository();
    useCase = new ListVideosUseCase(videoRepository, categoryRepository, genreRepository, castMemberRepository);
  });

  test('toOutput method', async () => {
    let result = new VideoSearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    let output = await useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

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

    result = new VideoSearchResult({
      items: [video],
      total: 1,
      current_page: 1,
      per_page: 2,
    });

    output = await useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [
        {
          id: video.id.value,
          title: video.title,
          description: video.description,
          year_launched: video.year_launched,
          duration: video.duration,
          rating: video.rating.value,
          is_opened: video.is_opened,
          is_published: video.is_published,
          categories: categories.map((i) => ({
            id: i.id.value,
            name: i.name,
            created_at: i.created_at,
          })),
          categories_id: categories.map((i) => i.id.value),
          genres: genres.map((i) => ({
            id: i.id.value,
            name: i.name,
            created_at: i.created_at,
          })),
          genres_id: genres.map((i) => i.id.value),
          cast_members: cast_members.map((i) => ({
            id: i.id.value,
            name: i.name,
            created_at: i.created_at,
          })),
          cast_members_id: cast_members.map((i) => i.id.value),
          created_at: video.created_at,
        },
      ],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });

  it('should search sorted by created_at when input param is empty', async () => {
    const categories = Category.fake().theCategories(3).build();
    await categoryRepository.bulkInsert(categories);
    const videos = [
      Video.fake().aVideoWithoutMedias().addCategoryId(categories[0].id).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[1].id)
        .withCreatedAt(new Date(new Date().getTime() + 100))
        .build(),
    ];
    await videoRepository.bulkInsert(videos);

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [
        VideoOutputMapper.toOutput(videos[1], [categories[1]]),
        VideoOutputMapper.toOutput(videos[0], [categories[0]]),
      ],
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should search applying paginate and filter by title', async () => {
    const categories = Category.fake().theCategories(6).build();
    await categoryRepository.bulkInsert(categories);
    const created_at = new Date();
    const videos = [
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('test')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withCreatedAt(created_at)
        .build(),
      Video.fake().aVideoWithoutMedias().withTitle('a').withCreatedAt(created_at).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TEST')
        .addCategoryId(categories[1].id)
        .withCreatedAt(created_at)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TeSt')
        .addCategoryId(categories[2].id)
        .addCategoryId(categories[3].id)
        .withCreatedAt(created_at)
        .build(),
    ];
    await videoRepository.bulkInsert(videos);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      filter: { title: 'TEST' },
    });
    expect(output).toStrictEqual({
      items: [
        VideoOutputMapper.toOutput(videos[0], [categories[0], categories[1]]),
        VideoOutputMapper.toOutput(videos[2], [categories[1]]),
      ],
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      filter: { title: 'TEST' },
    });
    expect(output).toStrictEqual({
      items: [VideoOutputMapper.toOutput(videos[3], [categories[2], categories[3]])],
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });
  });

  it('should search applying paginate and filter by categories_id', async () => {
    const categories = Category.fake().theCategories(4).build();
    await categoryRepository.bulkInsert(categories);

    const created_at = new Date();
    const videos = [
      Video.fake().aVideoWithoutMedias().addCategoryId(categories[0].id).withCreatedAt(created_at).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withCreatedAt(created_at)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .withCreatedAt(created_at)
        .build(),
      Video.fake().aVideoWithoutMedias().withCreatedAt(created_at).build(),
    ];
    await videoRepository.bulkInsert(videos);

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[0], [categories[0]]),
            VideoOutputMapper.toOutput(videos[1], [categories[0], categories[1]]),
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
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[0], [categories[0]]),
            VideoOutputMapper.toOutput(videos[1], [categories[0], categories[1]]),
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
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          filter: {
            categories_id: [categories[1].id.value, categories[2].id.value],
          },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[1], [categories[0], categories[1]]),
            VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]]),
          ],
          total: 2,
          current_page: 1,
          per_page: 2,
          last_page: 1,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);
      expect(output).toStrictEqual(item.output);
    }
  });

  it('should search applying paginate and sort', async () => {
    const categories = Category.fake().theCategories(6).build();
    await categoryRepository.bulkInsert(categories);
    expect(videoRepository.sortableFields).toStrictEqual(['title', 'created_at']);

    const videos = [
      Video.fake().aVideoWithoutMedias().withTitle('b').addCategoryId(categories[0].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('a').addCategoryId(categories[1].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('d').addCategoryId(categories[2].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('e').addCategoryId(categories[3].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('c').addCategoryId(categories[4].id).build(),
    ];
    await videoRepository.bulkInsert(videos);

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[1], [categories[1]]),
            VideoOutputMapper.toOutput(videos[0], [categories[0]]),
          ],
          total: 5,
          current_page: 1,
          per_page: 2,
          last_page: 3,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'title',
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[4], [categories[4]]),
            VideoOutputMapper.toOutput(videos[2], [categories[2]]),
          ],
          total: 5,
          current_page: 2,
          per_page: 2,
          last_page: 3,
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          sort_dir: 'desc' as SortDirection,
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[3], [categories[3]]),
            VideoOutputMapper.toOutput(videos[2], [categories[2]]),
          ],
          total: 5,
          current_page: 1,
          per_page: 2,
          last_page: 3,
        },
      },
      {
        input: {
          page: 2,
          per_page: 2,
          sort: 'title',
          sort_dir: 'desc' as SortDirection,
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[4], [categories[4]]),
            VideoOutputMapper.toOutput(videos[0], [categories[0]]),
          ],
          total: 5,
          current_page: 2,
          per_page: 2,
          last_page: 3,
        },
      },
    ];

    for (const item of arrange) {
      const output = await useCase.execute(item.input);
      expect(output).toStrictEqual(item.output);
    }
  });

  describe('should search applying filter by title, sort and paginate', () => {
    const categories = Category.fake().theCategories(6).build();

    const videos = [
      Video.fake().aVideoWithoutMedias().withTitle('test').addCategoryId(categories[0].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('a').addCategoryId(categories[1].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('TEST').addCategoryId(categories[2].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('e').addCategoryId(categories[3].id).build(),
      Video.fake().aVideoWithoutMedias().withTitle('TeSt').addCategoryId(categories[4].id).build(),
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
          items: [
            VideoOutputMapper.toOutput(videos[2], [categories[2]]),
            VideoOutputMapper.toOutput(videos[4], [categories[4]]),
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
          filter: { title: 'TEST' },
        },
        output: {
          items: [VideoOutputMapper.toOutput(videos[0], [categories[0]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await videoRepository.bulkInsert(videos);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "per_page": $input.per_page, "sort": $input.sort, "sort_dir": $input.sort_dir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  describe('should search applying filter by categories_id, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const videos = [
      Video.fake().aVideoWithoutMedias().withTitle('test').addCategoryId(categories[0].id).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('a')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TEST')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .build(),
      Video.fake().aVideoWithoutMedias().withTitle('e').addCategoryId(categories[3].id).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TeSt')
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
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
            VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]]),
            VideoOutputMapper.toOutput(videos[1], [categories[0], categories[1]]),
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
          items: [VideoOutputMapper.toOutput(videos[0], [categories[0]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: { categories_id: [categories[1].id.value] },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]]),
            VideoOutputMapper.toOutput(videos[4], [categories[1], categories[2]]),
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
          filter: { categories_id: [categories[1].id.value] },
        },
        output: {
          items: [VideoOutputMapper.toOutput(videos[1], [categories[0], categories[1]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]]),
            VideoOutputMapper.toOutput(videos[4], [categories[1], categories[2]]),
          ],
          total: 4,
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
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[1], [categories[0], categories[1]]),
            VideoOutputMapper.toOutput(videos[0], [categories[0]]),
          ],
          total: 4,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await videoRepository.bulkInsert(videos);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "per_page": $input.per_page, "sort": $input.sort, "sort_dir": $input.sort_dir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  describe('should search applying filter by title and categories_id, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const videos = [
      Video.fake().aVideoWithoutMedias().withTitle('test').addCategoryId(categories[0].id).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('a')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TEST')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .build(),
      Video.fake().aVideoWithoutMedias().withTitle('e').addCategoryId(categories[3].id).build(),
      Video.fake()
        .aVideoWithoutMedias()
        .withTitle('TeSt')
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
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
            categories_id: [categories[0].id.value],
          },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]]),
            VideoOutputMapper.toOutput(videos[0], [categories[0]]),
          ],
          total: 2,
          current_page: 1,
          per_page: 2,
          last_page: 1,
        },
      },
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: {
            title: 'TEST',
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            VideoOutputMapper.toOutput(videos[2], [categories[0], categories[1], categories[2]]),
            VideoOutputMapper.toOutput(videos[4], [categories[1], categories[2]]),
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
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [VideoOutputMapper.toOutput(videos[0], [categories[0]])],
          total: 3,
          current_page: 2,
          per_page: 2,
          last_page: 2,
        },
      },
    ];

    beforeEach(async () => {
      await categoryRepository.bulkInsert(categories);
      await videoRepository.bulkInsert(videos);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "per_page": $input.per_page, "sort": $input.sort, "sort_dir": $input.sort_dir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });
});
