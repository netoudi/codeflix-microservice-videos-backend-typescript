import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSearchParams, CastMemberSearchResult } from '@/core/cast-member/domain/cast-member.repository';
import { CastMemberModelMapper } from '@/core/cast-member/infra/db/sequelize/cast-member-model.mapper';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CastMemberSequelizeRepository Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  let repository: CastMemberSequelizeRepository;

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('should insert a new cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const entity = await repository.findById(castMember.id);
    expect(entity.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should find a cast member by id', async () => {
    let entity = await repository.findById(new CastMemberId());
    expect(entity).toBeNull();
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    entity = await repository.findById(castMember.id);
    expect(entity.toJSON()).toStrictEqual(castMember.toJSON());
  });

  it('should return all cast members', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const castMembers = await repository.findAll();
    expect(castMembers).toHaveLength(1);
    expect(JSON.stringify(castMembers)).toStrictEqual(JSON.stringify([castMember]));
  });

  it('should throw error on update when a cast member is not found', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await expect(repository.update(castMember)).rejects.toThrow(new NotFoundError(castMember.id, CastMember));
  });

  it('should update a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    castMember.changeName('name-updated');
    await repository.update(castMember);
    const entity = await repository.findById(castMember.id);
    expect(entity.toJSON()).toStrictEqual(castMember.toJSON());
    expect(entity.name).toBe('name-updated');
  });

  it('should throw error on delete when a cast member is not found', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await expect(repository.delete(castMember.id)).rejects.toThrow(new NotFoundError(castMember.id, CastMember));
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    await repository.delete(castMember.id);
    await expect(repository.findById(castMember.id)).resolves.toBeNull();
  });

  describe('search method tests', () => {
    it('should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const castMembers = CastMember.fake().theCastMembers(16).withName('John Doe').withCreatedAt(created_at).build();
      await repository.bulkInsert(castMembers);
      const spyToEntity = jest.spyOn(CastMemberModelMapper, 'toEntity');
      const result = await repository.search(new CastMemberSearchParams());
      expect(result).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(result.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        per_page: 15,
        last_page: 2,
      });
      result.items.forEach((castMember) => {
        expect(castMember).toBeInstanceOf(CastMember);
        expect(castMember.id).toBeDefined();
      });
      const items = result.items.map((castMember) => castMember.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'John Doe',
          type: 2,
          created_at: created_at,
        }),
      );
    });

    it('should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName((index) => `Movie ${index}`)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      await repository.bulkInsert(castMembers);
      const result = await repository.search(new CastMemberSearchParams());
      const items = result.items;
      [...items].reverse().forEach((castMember, index) => {
        expect(castMember.name).toBe(castMembers[index + 1].name);
      });
    });

    it('should apply paginate and filter', async () => {
      const castMembers = [
        CastMember.fake()
          .anActor()
          .withName('test')
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .aDirector()
          .withName('a')
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .anActor()
          .withName('TEST')
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .anActor()
          .withName('TeSt')
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];
      await repository.bulkInsert(castMembers);
      let result = await repository.search(
        new CastMemberSearchParams({
          page: 1,
          per_page: 2,
          filter: { name: 'TEST' },
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );
      result = await repository.search(
        new CastMemberSearchParams({
          page: 2,
          per_page: 2,
          filter: { name: 'TEST' },
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );
      result = await repository.search(
        new CastMemberSearchParams({
          page: 1,
          per_page: 2,
          filter: { type: 1 },
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[1]],
          total: 1,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );
      result = await repository.search(
        new CastMemberSearchParams({
          page: 1,
          per_page: 2,
          filter: { type: 2, name: 'TEST' },
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );
      result = await repository.search(
        new CastMemberSearchParams({
          page: 2,
          per_page: 2,
          filter: { type: 2, name: 'TEST' },
        }),
      );
      expect(result.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );
    });

    it('should apply paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);
      const castMembers = [
        CastMember.fake().aCastMember().withName('b').build(),
        CastMember.fake().aCastMember().withName('a').build(),
        CastMember.fake().aCastMember().withName('d').build(),
        CastMember.fake().aCastMember().withName('e').build(),
        CastMember.fake().aCastMember().withName('c').build(),
      ];
      await repository.bulkInsert(castMembers);
      const arrange = [
        {
          params: new CastMemberSearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[1], castMembers[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CastMemberSearchParams({
            page: 2,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[4], castMembers[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: new CastMemberSearchParams({
            page: 3,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[3]],
            total: 5,
            current_page: 3,
            per_page: 2,
          }),
        },
        {
          params: new CastMemberSearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[3], castMembers[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
      ];
      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const castMembers = [
        CastMember.fake().aCastMember().withName('test').build(),
        CastMember.fake().aCastMember().withName('a').build(),
        CastMember.fake().aCastMember().withName('TEST').build(),
        CastMember.fake().aCastMember().withName('e').build(),
        CastMember.fake().aCastMember().withName('TeSt').build(),
      ];

      const arrange = [
        {
          params: new CastMemberSearchParams({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[2], castMembers[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: new CastMemberSearchParams({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: { name: 'TEST' },
          }),
          result: new CastMemberSearchResult({
            items: [castMembers[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(castMembers);
      });

      test.each(arrange)('when value is $params', async ({ params, result }) => {
        const output = await repository.search(params);
        expect(output.toJSON(true)).toMatchObject(result.toJSON(true));
      });
    });
  });
});
