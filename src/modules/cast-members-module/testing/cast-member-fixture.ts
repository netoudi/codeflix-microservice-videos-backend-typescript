import { CastMember, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { SortDirection } from '@/core/shared/domain/repository/search-params';

const _keysInResponse = ['id', 'name', 'type', 'created_at'];

export class GetCastMemberFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const faker = CastMember.fake().aCastMember().withName('John Doe');
    return [
      {
        send_data: {
          name: faker.name,
          type: CastMemberType.DIRECTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberType.DIRECTOR,
        },
      },
      {
        send_data: {
          name: faker.name,
          type: CastMemberType.ACTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberType.ACTOR,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
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
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        send_data: {
          name: undefined,
          type: 1,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        send_data: {
          name: null,
          type: 1,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        send_data: {
          name: '',
          type: 1,
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      NAME_NOT_A_STRING: {
        send_data: {
          name: 5,
          type: 1,
        },
        expected: {
          message: ['name must be a string'],
          ...defaultExpected,
        },
      },
      TYPE_UNDEFINED: {
        send_data: {
          name: 'test',
          type: undefined,
        },
        expected: {
          message: ['type should not be empty', 'type must be an integer number'],
          ...defaultExpected,
        },
      },
      TYPE_NULL: {
        send_data: {
          name: 'test',
          type: null,
        },
        expected: {
          message: ['type should not be empty', 'type must be an integer number'],
          ...defaultExpected,
        },
      },
      TYPE_EMPTY: {
        send_data: {
          name: 'test',
          type: '',
        },
        expected: {
          message: ['type should not be empty', 'type must be an integer number'],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_NUMBER: {
        send_data: {
          name: 'test',
          type: '1',
        },
        expected: {
          message: ['type must be an integer number'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().aCastMember();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
          type: 1,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const faker = CastMember.fake().aCastMember().withName('John Doe');
    return [
      {
        send_data: {
          name: faker.name,
          type: CastMemberType.ACTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberType.ACTOR,
        },
      },
      {
        send_data: {
          name: faker.name,
          type: CastMemberType.DIRECTOR,
        },
        expected: {
          name: faker.name,
          type: CastMemberType.DIRECTOR,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_NOT_A_STRING: {
        send_data: {
          name: 5,
        },
        expected: {
          message: ['name must be a string'],
          ...defaultExpected,
        },
      },
      TYPE_NOT_A_NUMBER: {
        send_data: {
          type: '1',
        },
        expected: {
          message: ['type must be a number conforming to the specified constraints'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().aCastMember();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListCastMembersFixture {
  static arrangeIncrementedWithCreatedAt() {
    const _entities = CastMember.fake()
      .theCastMembers(4)
      .withName((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
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

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const faker = CastMember.fake().aCastMember();

    const entitiesMap = {
      a: faker.withName('a').withType(CastMemberType.ACTOR).build(),
      AAA: faker.withName('AAA').withType(CastMemberType.ACTOR).build(),
      AaA: faker.withName('AaA').withType(CastMemberType.ACTOR).build(),
      b: faker.withName('b').withType(CastMemberType.DIRECTOR).build(),
      c: faker.withName('c').withType(CastMemberType.DIRECTOR).build(),
    };

    const arrange = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
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
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.a],
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
          sort: 'name',
          filter: { name: 'a', type: 2 },
        },
        expected: {
          entities: [entitiesMap.AAA, entitiesMap.AaA],
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
          sort: 'name',
          filter: { name: 'a', type: 2 },
        },
        expected: {
          entities: [entitiesMap.a],
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
          sort: 'name',
          sort_dir: 'desc' as SortDirection,
          filter: { type: 1 },
        },
        expected: {
          entities: [entitiesMap.c, entitiesMap.b],
          meta: {
            total: 2,
            current_page: 1,
            last_page: 1,
            per_page: 2,
          },
        },
      },
    ];

    return { arrange, entitiesMap };
  }
}
