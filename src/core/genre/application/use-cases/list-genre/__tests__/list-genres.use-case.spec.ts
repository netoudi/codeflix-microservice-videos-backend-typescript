import { Category } from '@/core/category/domain/category.entity';
import { CategoryInMemoryRepository } from '@/core/category/infra/db/in-memory/category-in-memory.repository';
import { GenreOutputMapper } from '@/core/genre/application/use-cases/common/genre-output.mapper';
import { ListGenresUseCase } from '@/core/genre/application/use-cases/list-genre/list-genres.use-case';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { GenreSearchResult } from '@/core/genre/domain/genre.repository';
import { GenreInMemoryRepository } from '@/core/genre/infra/db/in-memory/genre-in-memory.repository';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

describe('ListGenresUseCase Unit Tests', () => {
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let useCase: ListGenresUseCase;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    useCase = new ListGenresUseCase(genreRepository, categoryRepository);
  });

  test('toOutput method', async () => {
    let result = new GenreSearchResult({
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

    const categories = Category.fake().theCategories(3).build();
    categoryRepository.bulkInsert(categories);
    const genre = Genre.fake().aGenre().addCategoryId(categories[0].id).addCategoryId(categories[1].id).build();

    result = new GenreSearchResult({
      items: [genre],
      total: 1,
      current_page: 1,
      per_page: 2,
    });

    output = await useCase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [
        {
          id: genre.id.value,
          name: genre.name,
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
          categories_id: [categories[0].id.value, categories[1].id.value],
          is_active: genre.is_active,
          created_at: genre.created_at,
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
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].id).build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categories[1].id)
        .withCreatedAt(new Date(new Date().getTime() + 100))
        .build(),
    ];
    await genreRepository.bulkInsert(genres);

    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [
        GenreOutputMapper.toOutput(genres[1], [categories[1]]),
        GenreOutputMapper.toOutput(genres[0], [categories[0]]),
      ],
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should search applying paginate and filter by name', async () => {
    const categories = Category.fake().theCategories(6).build();
    await categoryRepository.bulkInsert(categories);
    const created_at = new Date();
    const genres = [
      Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withCreatedAt(created_at)
        .build(),
      Genre.fake().aGenre().withName('a').withCreatedAt(created_at).build(),
      Genre.fake().aGenre().withName('TEST').addCategoryId(categories[1].id).withCreatedAt(created_at).build(),
      Genre.fake()
        .aGenre()
        .withName('TeSt')
        .addCategoryId(categories[2].id)
        .addCategoryId(categories[3].id)
        .withCreatedAt(created_at)
        .build(),
    ];
    await genreRepository.bulkInsert(genres);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      filter: { name: 'TEST' },
    });
    expect(output).toStrictEqual({
      items: [
        GenreOutputMapper.toOutput(genres[0], [categories[0], categories[1]]),
        GenreOutputMapper.toOutput(genres[2], [categories[1]]),
      ],
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      filter: { name: 'TEST' },
    });
    expect(output).toStrictEqual({
      items: [GenreOutputMapper.toOutput(genres[3], [categories[2], categories[3]])],
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
    const genres = [
      Genre.fake().aGenre().addCategoryId(categories[0].id).withCreatedAt(created_at).build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withCreatedAt(created_at)
        .build(),
      Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .withCreatedAt(created_at)
        .build(),
      Genre.fake().aGenre().withCreatedAt(created_at).build(),
    ];
    await genreRepository.bulkInsert(genres);

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
            GenreOutputMapper.toOutput(genres[1], [categories[0], categories[1]]),
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
          items: [GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]])],
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
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
            GenreOutputMapper.toOutput(genres[1], [categories[0], categories[1]]),
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
          items: [GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]])],
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
            GenreOutputMapper.toOutput(genres[1], [categories[0], categories[1]]),
            GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]]),
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
    expect(genreRepository.sortableFields).toStrictEqual(['name', 'created_at']);

    const genres = [
      Genre.fake().aGenre().withName('b').addCategoryId(categories[0].id).build(),
      Genre.fake().aGenre().withName('a').addCategoryId(categories[1].id).build(),
      Genre.fake().aGenre().withName('d').addCategoryId(categories[2].id).build(),
      Genre.fake().aGenre().withName('e').addCategoryId(categories[3].id).build(),
      Genre.fake().aGenre().withName('c').addCategoryId(categories[4].id).build(),
    ];
    await genreRepository.bulkInsert(genres);

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[1], [categories[1]]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
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
          sort: 'name',
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[4], [categories[4]]),
            GenreOutputMapper.toOutput(genres[2], [categories[2]]),
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
          sort: 'name',
          sort_dir: 'desc' as SortDirection,
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[3], [categories[3]]),
            GenreOutputMapper.toOutput(genres[2], [categories[2]]),
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
          sort: 'name',
          sort_dir: 'desc' as SortDirection,
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[4], [categories[4]]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
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

  describe('should search applying filter by name, sort and paginate', () => {
    const categories = Category.fake().theCategories(6).build();

    const genres = [
      Genre.fake().aGenre().withName('test').addCategoryId(categories[0].id).build(),
      Genre.fake().aGenre().withName('a').addCategoryId(categories[1].id).build(),
      Genre.fake().aGenre().withName('TEST').addCategoryId(categories[2].id).build(),
      Genre.fake().aGenre().withName('e').addCategoryId(categories[3].id).build(),
      Genre.fake().aGenre().withName('TeSt').addCategoryId(categories[4].id).build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[2]]),
            GenreOutputMapper.toOutput(genres[4], [categories[4]]),
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
          sort: 'name',
          filter: { name: 'TEST' },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
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

    const genres = [
      Genre.fake().aGenre().withName('test').addCategoryId(categories[0].id).build(),
      Genre.fake().aGenre().withName('a').addCategoryId(categories[0].id).addCategoryId(categories[1].id).build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .build(),
      Genre.fake().aGenre().withName('e').addCategoryId(categories[3].id).build(),
      Genre.fake().aGenre().withName('TeSt').addCategoryId(categories[1].id).addCategoryId(categories[2].id).build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]]),
            GenreOutputMapper.toOutput(genres[1], [categories[0], categories[1]]),
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
          sort: 'name',
          filter: { categories_id: [categories[0].id.value] },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
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
          sort: 'name',
          filter: { categories_id: [categories[1].id.value] },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]]),
            GenreOutputMapper.toOutput(genres[4], [categories[1], categories[2]]),
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
          sort: 'name',
          filter: { categories_id: [categories[1].id.value] },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[1], [categories[0], categories[1]])],
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
          sort: 'name',
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]]),
            GenreOutputMapper.toOutput(genres[4], [categories[1], categories[2]]),
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
          sort: 'name',
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[1], [categories[0], categories[1]]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
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
      await genreRepository.bulkInsert(genres);
    });

    test.each(arrange)(
      'when input is {"filter": $input.filter, "page": $input.page, "per_page": $input.per_page, "sort": $input.sort, "sort_dir": $input.sort_dir}',
      async ({ input, output: expectedOutput }) => {
        const output = await useCase.execute(input);
        expect(output).toStrictEqual(expectedOutput);
      },
    );
  });

  describe('should search applying filter by name and categories_id, sort and paginate', () => {
    const categories = Category.fake().theCategories(4).build();

    const genres = [
      Genre.fake().aGenre().withName('test').addCategoryId(categories[0].id).build(),
      Genre.fake().aGenre().withName('a').addCategoryId(categories[0].id).addCategoryId(categories[1].id).build(),
      Genre.fake()
        .aGenre()
        .withName('TEST')
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .build(),
      Genre.fake().aGenre().withName('e').addCategoryId(categories[3].id).build(),
      Genre.fake().aGenre().withName('TeSt').addCategoryId(categories[1].id).addCategoryId(categories[2].id).build(),
    ];

    const arrange = [
      {
        input: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: {
            name: 'TEST',
            categories_id: [categories[0].id.value],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]]),
            GenreOutputMapper.toOutput(genres[0], [categories[0]]),
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
          sort: 'name',
          filter: {
            name: 'TEST',
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [
            GenreOutputMapper.toOutput(genres[2], [categories[0], categories[1], categories[2]]),
            GenreOutputMapper.toOutput(genres[4], [categories[1], categories[2]]),
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
          sort: 'name',
          filter: {
            name: 'TEST',
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        output: {
          items: [GenreOutputMapper.toOutput(genres[0], [categories[0]])],
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
