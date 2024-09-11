import { GetCastMemberUseCase } from '@/core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('GetCastMemberUseCase Integration Tests', () => {
  let useCase: GetCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new GetCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, CastMember));
  });

  it('should return a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const output = await useCase.execute({ id: castMember.id.value });
    expect(output).toStrictEqual({
      id: castMember.id.value,
      name: castMember.name,
      type: castMember.type,
      created_at: castMember.created_at,
    });
  });
});
