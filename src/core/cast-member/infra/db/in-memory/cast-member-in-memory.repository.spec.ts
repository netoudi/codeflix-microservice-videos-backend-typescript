import { CastMember, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';

describe('CastMemberInMemoryRepository Unit Tests', () => {
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
  });

  it('should no filter items when filter object is null', async () => {
    const items = [CastMember.fake().aCastMember().build()];
    const filterSpy = jest.spyOn(items, 'filter');
    const itemsFiltered = await repository['applyFilter'](items, null);
    expect(filterSpy).not.toHaveBeenCalled();
    expect(itemsFiltered).toStrictEqual(items);
  });

  it('should filter items using filter parameter', async () => {
    const items = [
      CastMember.fake().aCastMember().withName('test').build(),
      CastMember.fake().aCastMember().withName('TEST').build(),
      CastMember.fake().aCastMember().withName('fake').build(),
    ];

    const spyFilter = jest.spyOn(items, 'filter');

    const itemsFiltered = await repository['applyFilter'](items, { name: 'TEST' });
    expect(spyFilter).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should filter items using filter parameter type ACTOR', async () => {
    const items = [
      CastMember.fake().anActor().build(),
      CastMember.fake().anActor().build(),
      CastMember.fake().aDirector().build(),
    ];

    const spyFilter = jest.spyOn(items, 'filter');

    const itemsFiltered = await repository['applyFilter'](items, { type: CastMemberType.ACTOR });
    expect(spyFilter).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
  });

  it('should filter items using filter parameter type DIRECTOR', async () => {
    const items = [
      CastMember.fake().anActor().build(),
      CastMember.fake().anActor().build(),
      CastMember.fake().aDirector().build(),
    ];

    const spyFilter = jest.spyOn(items, 'filter');

    const itemsFiltered = await repository['applyFilter'](items, { type: CastMemberType.DIRECTOR });
    expect(spyFilter).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[2]]);
  });

  it('should filter items using filter parameter name and type', async () => {
    const items = [
      CastMember.fake().anActor().withName('John Doe').build(),
      CastMember.fake().anActor().withName('Jane Doe').build(),
      CastMember.fake().aDirector().build(),
    ];

    const spyFilter = jest.spyOn(items, 'filter');

    const itemsFiltered = await repository['applyFilter'](items, { name: 'jane', type: CastMemberType.ACTOR });
    expect(spyFilter).toHaveBeenCalledTimes(1);
    expect(itemsFiltered).toStrictEqual([items[1]]);
  });

  it('should sort by created_at when sort param is null', async () => {
    const created_at = new Date();
    const items = [
      CastMember.fake().aCastMember().withName('test').withCreatedAt(created_at).build(),
      CastMember.fake()
        .aCastMember()
        .withName('TEST')
        .withCreatedAt(new Date(created_at.getTime() + 100))
        .build(),
      CastMember.fake()
        .aCastMember()
        .withName('fake')
        .withCreatedAt(new Date(created_at.getTime() + 200))
        .build(),
    ];
    const itemsFiltered = repository['applySort'](items, null, null);
    expect(itemsFiltered).toStrictEqual([items[2], items[1], items[0]]);
  });

  it('should sort by name', async () => {
    const items = [
      CastMember.fake().aCastMember().withName('c').build(),
      CastMember.fake().aCastMember().withName('b').build(),
      CastMember.fake().aCastMember().withName('a').build(),
    ];
    let itemsFiltered = repository['applySort'](items, 'name', 'asc');
    expect(itemsFiltered).toStrictEqual([items[2], items[1], items[0]]);
    itemsFiltered = repository['applySort'](items, 'name', 'desc');
    expect(itemsFiltered).toStrictEqual([items[0], items[1], items[2]]);
  });
});
