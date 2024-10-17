import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { Category } from '@/core/category/domain/category.entity';
import { Genre } from '@/core/genre/domain/genre.aggregate';
import { SortDirection } from '@/core/shared/domain/repository/search-params';
import { Video } from '@/core/video/domain/video.aggregate';

const _keysInResponse = [
  'id',
  'title',
  'description',
  'year_launched',
  'duration',
  'rating',
  'is_opened',
  'is_published',
  'categories',
  'categories_id',
  'genres',
  'genres_id',
  'cast_members',
  'cast_members_id',
  'created_at',
];

export class GetVideoFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateVideoFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Video.fake().aVideoWithoutMedias().build();

    const category = Category.fake().aCategory().build();
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    const cast_member = CastMember.fake().aCastMember().build();

    const case1 = {
      relations: {
        categories: [category],
        genres: [genre],
        cast_members: [cast_member],
      },
      send_data: {
        title: faker.title,
        description: faker.description,
        year_launched: faker.year_launched,
        duration: faker.duration,
        rating: faker.rating.value,
        is_opened: faker.is_opened,
        categories_id: [category.id.value],
        genres_id: [genre.id.value],
        cast_members_id: [cast_member.id.value],
      },
      expected: {
        title: faker.title,
        description: faker.description,
        year_launched: faker.year_launched,
        duration: faker.duration,
        rating: faker.rating.value,
        is_opened: faker.is_opened,
        is_published: false,
        categories: [
          {
            id: category.id.value,
            name: category.name,
            created_at: category.created_at.toISOString(),
          },
        ],
        categories_id: [category.id.value],
        genres: [
          {
            id: genre.id.value,
            name: genre.name,
            created_at: genre.created_at.toISOString(),
          },
        ],
        genres_id: [genre.id.value],
        cast_members: [
          {
            id: cast_member.id.value,
            name: cast_member.name,
            created_at: cast_member.created_at.toISOString(),
          },
        ],
        cast_members_id: [cast_member.id.value],
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const genres = Genre.fake().theGenres(3).addCategoryId(categories[0].id).build();
    const cast_members = CastMember.fake().theCastMembers(3).build();

    const case2 = {
      relations: {
        categories,
        genres,
        cast_members,
      },
      send_data: {
        title: faker.title,
        description: faker.description,
        year_launched: faker.year_launched,
        duration: faker.duration,
        rating: faker.rating.value,
        is_opened: faker.is_opened,
        categories_id: categories.map((e) => e.id.value),
        genres_id: genres.map((e) => e.id.value),
        cast_members_id: cast_members.map((e) => e.id.value),
      },
      expected: {
        title: faker.title,
        description: faker.description,
        year_launched: faker.year_launched,
        duration: faker.duration,
        rating: faker.rating.value,
        is_opened: faker.is_opened,
        is_published: false,
        categories: expect.arrayContaining(
          categories.map((e) => {
            return {
              id: e.id.value,
              name: e.name,
              created_at: e.created_at.toISOString(),
            };
          }),
        ),
        categories_id: expect.arrayContaining(categories.map((e) => e.id.value)),
        genres: expect.arrayContaining(
          genres.map((e) => {
            return {
              id: e.id.value,
              name: e.name,
              created_at: e.created_at.toISOString(),
            };
          }),
        ),
        genres_id: expect.arrayContaining(genres.map((e) => e.id.value)),
        cast_members: expect.arrayContaining(
          cast_members.map((e) => {
            return {
              id: e.id.value,
              name: e.name,
              created_at: e.created_at.toISOString(),
            };
          }),
        ),
        cast_members_id: expect.arrayContaining(cast_members.map((e) => e.id.value)),
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
            'title should not be empty',
            'title must be a string',
            'description should not be empty',
            'description must be a string',
            'year_launched should not be empty',
            'year_launched must be an integer number',
            'duration should not be empty',
            'duration must be an integer number',
            'rating should not be empty',
            'rating must be one of the following values: L, 10, 12, 14, 16, 18',
            'categories_id should not be empty',
            'categories_id must be an array',
            'each value in categories_id must be a UUID',
            'genres_id should not be empty',
            'genres_id must be an array',
            'each value in genres_id must be a UUID',
            'cast_members_id should not be empty',
            'cast_members_id must be an array',
            'each value in cast_members_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      TITLE_UNDEFINED: {
        send_data: {
          title: undefined,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['title should not be empty', 'title must be a string'],
          ...defaultExpected,
        },
      },
      TITLE_NULL: {
        send_data: {
          title: null,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['title should not be empty', 'title must be a string'],
          ...defaultExpected,
        },
      },
      TITLE_EMPTY: {
        send_data: {
          title: '',
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['title should not be empty'],
          ...defaultExpected,
        },
      },
      DESCRIPTION_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: undefined,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['description should not be empty', 'description must be a string'],
          ...defaultExpected,
        },
      },
      DESCRIPTION_NULL: {
        send_data: {
          title: faker.title,
          description: null,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['description should not be empty', 'description must be a string'],
          ...defaultExpected,
        },
      },
      DESCRIPTION_EMPTY: {
        send_data: {
          title: faker.title,
          description: '',
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['description should not be empty'],
          ...defaultExpected,
        },
      },
      YEAR_LAUNCHED_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: undefined,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['year_launched should not be empty', 'year_launched must be an integer number'],
          ...defaultExpected,
        },
      },
      YEAR_LAUNCHED_NULL: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: null,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['year_launched should not be empty', 'year_launched must be an integer number'],
          ...defaultExpected,
        },
      },
      YEAR_LAUNCHED_EMPTY: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: '',
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['year_launched should not be empty', 'year_launched must be an integer number'],
          ...defaultExpected,
        },
      },
      DURATION_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: undefined,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['duration should not be empty', 'duration must be an integer number'],
          ...defaultExpected,
        },
      },
      DURATION_NULL: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: null,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['duration should not be empty', 'duration must be an integer number'],
          ...defaultExpected,
        },
      },
      DURATION_EMPTY: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: '',
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['duration should not be empty', 'duration must be an integer number'],
          ...defaultExpected,
        },
      },
      RATING_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: undefined,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['rating should not be empty', 'rating must be one of the following values: L, 10, 12, 14, 16, 18'],
          ...defaultExpected,
        },
      },
      RATING_NULL: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: null,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['rating should not be empty', 'rating must be one of the following values: L, 10, 12, 14, 16, 18'],
          ...defaultExpected,
        },
      },
      RATING_EMPTY: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: '',
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['rating should not be empty', 'rating must be one of the following values: L, 10, 12, 14, 16, 18'],
          ...defaultExpected,
        },
      },
      IS_OPENED_EMPTY: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: '',
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['is_opened must be a boolean value'],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: undefined,
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
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
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: null,
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
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
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: '',
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
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
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: ['a'],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['each value in categories_id must be a UUID'],
          ...defaultExpected,
        },
      },
      GENRES_ID_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: undefined,
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: [
            'genres_id should not be empty',
            'genres_id must be an array',
            'each value in genres_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_NULL: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: null,
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: [
            'genres_id should not be empty',
            'genres_id must be an array',
            'each value in genres_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_EMPTY: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: '',
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: [
            'genres_id should not be empty',
            'genres_id must be an array',
            'each value in genres_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      GENRES_ID_NOT_VALID: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: ['a'],
          cast_members_id: [faker.cast_members_id[0].value],
        },
        expected: {
          message: ['each value in genres_id must be a UUID'],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_UNDEFINED: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: undefined,
        },
        expected: {
          message: [
            'cast_members_id should not be empty',
            'cast_members_id must be an array',
            'each value in cast_members_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_NULL: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: null,
        },
        expected: {
          message: [
            'cast_members_id should not be empty',
            'cast_members_id must be an array',
            'each value in cast_members_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_EMPTY: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: '',
        },
        expected: {
          message: [
            'cast_members_id should not be empty',
            'cast_members_id must be an array',
            'each value in cast_members_id must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      CAST_MEMBERS_ID_NOT_VALID: {
        send_data: {
          title: faker.title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: [faker.categories_id[0].value],
          genres_id: [faker.genres_id[0].value],
          cast_members_id: ['a'],
        },
        expected: {
          message: ['each value in cast_members_id must be a UUID'],
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
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
          genres_id: ['6ad5afa4-78a5-4ada-bf78-cd443a97862b'],
          cast_members_id: ['b70d1edb-d978-46c4-a22b-c2bb01c99b13'],
        },
        expected: {
          message: [
            'title must be shorter than or equal to 255 characters',
            'Entity Category with id d8952775-5f69-42d5-9e94-00f097e1b98c not found',
            'Entity Genre with id 6ad5afa4-78a5-4ada-bf78-cd443a97862b not found',
            'Entity CastMember with id b70d1edb-d978-46c4-a22b-c2bb01c99b13 not found',
          ],
          ...defaultExpected,
        },
      },
      CATEGORIES_ID_AND_GENRES_ID_AND_CAST_MEMBERS_ID_NOT_EXISTS: {
        send_data: {
          title: faker.withTitle('action').title,
          description: faker.description,
          year_launched: faker.year_launched,
          duration: faker.duration,
          rating: faker.rating.value,
          is_opened: faker.is_opened,
          categories_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
          genres_id: ['6ad5afa4-78a5-4ada-bf78-cd443a97862b'],
          cast_members_id: ['b70d1edb-d978-46c4-a22b-c2bb01c99b13'],
        },
        expected: {
          message: [
            'Entity Category with id d8952775-5f69-42d5-9e94-00f097e1b98c not found',
            'Entity Genre with id 6ad5afa4-78a5-4ada-bf78-cd443a97862b not found',
            'Entity CastMember with id b70d1edb-d978-46c4-a22b-c2bb01c99b13 not found',
          ],
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
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    const cast_member = CastMember.fake().aCastMember().build();

    const case1 = {
      entity: faker.addCategoryId(category.id).addGenreId(genre.id).addCastMemberId(cast_member.id).build(),
      relations: {
        categories: [category],
        genres: [genre],
        cast_members: [cast_member],
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
      entity: faker.addCategoryId(category.id).addGenreId(genre.id).addCastMemberId(cast_member.id).build(),
      relations: {
        categories: [category],
        genres: [genre],
        cast_members: [cast_member],
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
    const genres = Genre.fake().theGenres(3).addCategoryId(categories[0].id).build();
    const cast_members = CastMember.fake().theCastMembers(3).build();

    const case3 = {
      entity: faker.addCategoryId(category.id).addGenreId(genre.id).addCastMemberId(cast_member.id).build(),
      relations: {
        categories: [category, ...categories],
        genres: [genre, ...genres],
        cast_members: [cast_member, ...cast_members],
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
      GENRES_ID_NOT_VALID: {
        send_data: {
          title: faker.title,
          genres_id: ['a'],
        },
        expected: {
          message: ['each value in genres_id must be a UUID'],
          ...defaultExpected,
        },
      },
      CAST_MEMBER_ID_NOT_VALID: {
        send_data: {
          title: faker.title,
          cast_members_id: ['a'],
        },
        expected: {
          message: ['each value in cast_members_id must be a UUID'],
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
      GENRES_ID_NOT_EXISTS: {
        send_data: {
          title: faker.withTitle('action').title,
          genres_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: ['Entity Genre with id d8952775-5f69-42d5-9e94-00f097e1b98c not found'],
          ...defaultExpected,
        },
      },
      CAST_MEMBER_ID_NOT_EXISTS: {
        send_data: {
          title: faker.withTitle('action').title,
          cast_members_id: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: ['Entity CastMember with id d8952775-5f69-42d5-9e94-00f097e1b98c not found'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListVideosFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake().aGenre().addCategoryId(category.id).build();
    const cast_member = CastMember.fake().aCastMember().build();
    const _entities = Video.fake()
      .theVideosWithoutMedias(4)
      .addCategoryId(category.id)
      .addGenreId(genre.id)
      .addCastMemberId(cast_member.id)
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
      genres: new Map([[genre.id.value, genre]]),
      cast_members: new Map([[cast_member.id.value, cast_member]]),
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
    const genres = Genre.fake().theGenres(4).addCategoryId(categories[0].id).build();
    const cast_members = CastMember.fake().theCastMembers(4).build();

    const relations = {
      categories: new Map(categories.map((category) => [category.id.value, category])),
      genres: new Map(genres.map((genre) => [genre.id.value, genre])),
      cast_members: new Map(cast_members.map((cast_member) => [cast_member.id.value, cast_member])),
    };

    const created_at = new Date();

    const entitiesMap = {
      test: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addGenreId(genres[0].id)
        .addCastMemberId(cast_members[0].id)
        .withTitle('test')
        .withCreatedAt(new Date(created_at.getTime() + 1000))
        .build(),
      a: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addGenreId(genres[0].id)
        .addCastMemberId(cast_members[0].id)
        .withTitle('a')
        .withCreatedAt(new Date(created_at.getTime() + 2000))
        .build(),
      TEST: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[0].id)
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addCastMemberId(cast_members[0].id)
        .withTitle('TEST')
        .withCreatedAt(new Date(created_at.getTime() + 3000))
        .build(),
      e: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[3].id)
        .addGenreId(genres[0].id)
        .addCastMemberId(cast_members[0].id)
        .withTitle('e')
        .withCreatedAt(new Date(created_at.getTime() + 4000))
        .build(),
      TeSt: Video.fake()
        .aVideoWithoutMedias()
        .addCategoryId(categories[1].id)
        .addCategoryId(categories[2].id)
        .addGenreId(genres[0].id)
        .addCastMemberId(cast_members[0].id)
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
