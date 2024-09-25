import { CreateCastMemberUseCase } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CastMemberId, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CreateCastMemberUseCase Integration Tests', () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should create a new cast member', async () => {
    let output = await useCase.execute({ name: 'test', type: CastMemberType.ACTOR });
    let castMember = await repository.findById(new CastMemberId(output.id));
    expect(output).toStrictEqual({
      id: castMember!.id.value,
      name: 'test',
      type: 2,
      created_at: castMember!.created_at,
    });
    output = await useCase.execute({ name: 'test', type: CastMemberType.DIRECTOR });
    castMember = await repository.findById(new CastMemberId(output.id));
    expect(output).toStrictEqual({
      id: castMember!.id.value,
      name: 'test',
      type: 1,
      created_at: castMember!.created_at,
    });
  });
});
