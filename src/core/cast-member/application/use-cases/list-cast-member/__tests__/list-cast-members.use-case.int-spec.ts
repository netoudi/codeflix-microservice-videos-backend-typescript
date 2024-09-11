import { CastMemberOutputMapper } from '@/core/cast-member/application/use-cases/common/cast-member-output.mapper';
import { ListCastMembersUseCase } from '@/core/cast-member/application/use-cases/list-cast-member/list-cast-members.use-case';
import { CastMember, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('ListCastMembersUseCase Integration Tests', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const castMembers = CastMember.fake()
      .theCastMembers(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();
    await repository.bulkInsert(castMembers);
    const output = await useCase.execute({});
    expect(output).toStrictEqual({
      items: [...castMembers].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return output using pagination, sort and filter', async () => {
    const castMembers = [
      new CastMember({ name: 'a', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'AAA', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'AaA', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'b', type: CastMemberType.ACTOR }),
      new CastMember({ name: 'c', type: CastMemberType.ACTOR }),
    ];
    await repository.bulkInsert(castMembers);
    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[2]].map(CastMemberOutputMapper.toOutput),
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
      items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
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
      items: [castMembers[0], castMembers[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
