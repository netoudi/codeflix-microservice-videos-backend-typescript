import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { ListCastMembersUseCase } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { CastMember, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';

describe('ListCastMembersUseCase Unit Tests', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new ListCastMembersUseCase(repository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const items = [
      new CastMember({ name: 'test 1', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'test 2', type: CastMemberType.ACTOR, created_at: new Date(new Date().getTime() + 1000) }),
    ];
    repository.items = items;
    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return output using pagination, sort and filter', async () => {
    const items = [
      new CastMember({ name: 'a', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'AAA', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'AaA', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'b', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'c', type: CastMemberType.ACTOR }),
    ];
    repository.items = items;
    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });
    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[0], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
