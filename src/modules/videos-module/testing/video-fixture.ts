import { Category } from '@/core/category/domain/category.entity';
import { SortDirection } from '@/core/shared/domain/repository/search-params';
import { Video } from '@/core/video/domain/video.aggregate';

const _keysInResponse = ['id', 'title', 'categories_id', 'categories', 'is_opened', 'created_at'];

export class GetVideoFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Video.fake().aVideoWithoutMedias().withTitle('test title');

    const category = Category.fake().aCategory().build();

    const case1 = {
      relations: {
        categories: [category],
      },
      send_data: {
        title: faker.title,
        categories_id: [category.id.value],
      },
      expected: {
        title: faker.title,
        categories: expect.arrayContaining([
          {
            id: category.id.value,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
        categories_id: expect.arrayContaining([category.id.value]),
        is_opened: true,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case2 = {
      relations: {
        categories,
      },
      send_data: {
        title: faker.title,
        categories_id: [categories[0].id.value, categories[1].id.value, categories[2].id.value],
        categories: expect.arrayContaining([
          {
            id: categories[0].id.value,
            name: categories[0].name,
            created_at: categories[0].created_at.toISOString(),
          },
          {
            id: categories[1].id.value,
            name: categories[1].name,
            created_at: categories[1].created_at.toISOString(),
          },
          {
            id: categories[2].id.value,
            name: categories[2].name,
            created_at: categories[2].created_at.toISOString(),
          },
        ]),
        is_opened: false,
      },
      expected: {
        title: faker.title,
        categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value, categories[2].id.value]),
        categories: expect.arrayContaining([
          {
            id: categories[0].id.value,
            name: categories[0].name,
            created_at: categories[0].created_at.toISOString(),
          },
          {
            id: categories[1].id.value,
            name: categories[1].name,
            created_at: categories[1].created_at.toISOString(),
          },
          {
            id: categories[2].id.value,
            name: categories[2].name,
            created_at: categories[2].created_at.toISOString(),
          },
        ]),
        is_opened: false,
      },
    };

    return [case1, case2];
  }

  static arrangeInvalidRequest() {
    const faker = Video.fake().aVideoWithoutMedias();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        send_data: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'categories_id should not be empty',
            'categories_id must be an array',
            'each value in categories_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        send_data: {
          title: undefined,
          categories_id: [faker.categories_id[0].value],
        },
        expected: {
          message: ['title should not be empty', 'title must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        send_data: {
          title: null,
          categories_id: [faker.categories_id[0].value],
        },
        expected: {
          message: ['title should not be empty', 'title must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        send_data: {
          title: '',
          categories_id: [faker.categories_id[0].value],
        },
        expected: {
          message: ['title should not be empty'],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_UNDEFINED: {
        send_data: {
          title: faker.title,
          categories_id: undefined,
        },
        expected: {
          message: [
            'categories_id should not be empty',
            'categories_id must be an array',
            'each value in categories_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NULL: {
        send_data: {
          title: faker.title,
          categories_id: null,
        },
        expected: {
          message: [
            'categories_id should not be empty',
            'categories_id must be an array',
            'each value in categories_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_EMPTY: {
        send_data: {
          title: faker.title,
          categories_id: '',
        },
        expected: {
          message: [
            'categories_id should not be empty',
            'categories_id must be an array',
            'each value in categories_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_VALID: {
        send_data: {
          title: faker.title,
          categories_id: ['a'],
        },
        expected: {
          message: ['each value in categories_id must be a UUID'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Video.fake().aVideoWithoutMedias();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          title: faker.withInvalidTitleTooLong().title,
          categories_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'title must be shorter than or equal to 255 characters',
            'Entity Category with id d8952775-5f69-42d5-9e94-00f097e1b98c not found',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_NOT_EXISTS: {
        send_data: {
          title: faker.withTitle('action').title,
          categories_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: ['Entity Category with id d8952775-5f69-42d5-9e94-00f097e1b98c not found'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Video.fake().aVideoWithoutMedias().withTitle('test title');

    const category = Category.fake().aCategory().build();

    const case1 = {
      entity: faker.addCategoryId(category.id).build(),
      relations: {
        categories: [category],
      },
      send_data: {
        title: faker.title,
        categories_id: [category.id.value],
      },
      expected: {
        title: faker.title,
        categories_id: expect.arrayContaining([category.id.value]),
        categories: expect.arrayContaining([
          {
            id: category.id.value,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
        is_opened: true,
      },
    };

    const case2 = {
      entity: faker.addCategoryId(category.id).build(),
      relations: {
        categories: [category],
      },
      send_data: {
        title: faker.title,
        categories_id: [category.id.value],
        is_opened: false,
      },
      expected: {
        title: faker.title,
        categories_id: expect.arrayContaining([category.id.value]),
        categories: expect.arrayContaining([
          {
            id: category.id.value,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ]),
        is_opened: false,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case3 = {
      entity: faker.addCategoryId(category.id).build(),
      relations: {
        categories: [category, ...categories],
      },
      send_data: {
        title: faker.title,
        categories_id: [categories[0].id.value, categories[1].id.value, categories[2].id.value],
      },
      expected: {
        title: faker.title,
        categories_id: expect.arrayContaining([categories[0].id.value, categories[1].id.value, categories[2].id.value]),
        categories: expect.arrayContaining([
          {
            id: categories[0].id.value,
            name: categories[0].name,
            created_at: categories[0].created_at.toISOString(),
          },
          {
            id: categories[1].id.value,
            name: categories[1].name,
            created_at: categories[1].created_at.toISOString(),
          },
          {
            id: categories[2].id.value,
            name: categories[2].name,
            created_at: categories[2].created_at.toISOString(),
          },
        ]),
        is_opened: true,
      },
    };

    return [case1, case2, case3];
  }

  static arrangeInvalidRequest() {
    const faker = Video.fake().aVideoWithoutMedias();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      CATEGORIES_ID_NOT_VALID: {
        send_data: {
          title: faker.title,
          categories_id: ['a'],
        },
        expected: {
          message: ['each value in categories_id must be a UUID'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Video.fake().aVideoWithoutMedias();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      CATEGORIES_ID_NOT_EXISTS: {
        send_data: {
          title: faker.withTitle('action').title,
          categories_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: ['Entity Category with id d8952775-5f69-42d5-9e94-00f097e1b98c not found'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListVideosFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const _entities = Video.fake()
      .theVideosWithoutMedias(4)
      .addCategoryId(category.id)
      .withTitle((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const relations = {
      categories: new Map([[category.id.value, category]]),
    };

    const arrange = [
      {
        send_data: {},
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third, entitiesMap.second, entitiesMap.first],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap, relations };
  }

  static arrangeUnsorted() {
    const categories = Category.fake().theCategories(4).build();

    const relations = {
      categories: new Map(categories.map((category) => [category.id.value, category])),
    };

    const created_at = new Date();

    const entitiesMap = {
      test: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withTitle('test')
        .withCreatedAt(new Date(created_at.getTime() + 1000))
        .build(),
      a: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .withTitle('a')
        .withCreatedAt(new Date(created_at.getTime() + 2000))
        .build(),
      TEST: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .withTitle('TEST')
        .withCreatedAt(new Date(created_at.getTime() + 3000))
        .build(),
      e: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[3].id)
        .withTitle('e')
        .withCreatedAt(new Date(created_at.getTime() + 4000))
        .build(),
      TeSt: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .withTitle('TeSt')
        .withCreatedAt(new Date(created_at.getTime() + 5000))
        .build(),
    };

    const arrange_filter_by_title_sort_title_asc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'title',
          filter: { title: 'TEST' },
        },
        get label() {
          return JSON.stringify(this.send_data);
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.TeSt],
          meta: {
            total: 3,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'title',
          filter: { title: 'TEST' },
        },
        get label() {
          return JSON.stringify(this.send_data);
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
    ];

    const arrange_filter_by_categories_id_and_sort_by_created_desc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: { categories_id: [categories[0].id.value] },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.a],
          meta: {
            total: 3,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: { categories_id: [categories[0].id.value] },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.TeSt, entitiesMap.TEST],
          meta: {
            total: 4,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: {
            categories_id: [categories[0].id.value, categories[1].id.value],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.send_data,
            filter: { categories_id_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.a, entitiesMap.test],
          meta: {
            total: 4,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
    ];

    return {
      arrange: [...arrange_filter_by_title_sort_title_asc, ...arrange_filter_by_categories_id_and_sort_by_created_desc],
      entitiesMap,
      relations,
    };
  }
}
