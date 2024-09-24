import { DeleteCastMemberUseCase } from '@/core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('DeleteCastMemberUseCase Integration Tests', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new DeleteCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const castMemberId = new CastMemberId();
    await expect(useCase.execute({ id: castMemberId.value })).rejects.toThrow(
      new NotFoundError(castMemberId.value, CastMember),
    );
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    await useCase.execute({ id: castMember.id.value });
    await expect(repository.findById(castMember.id)).resolves.toBeNull();
  });
});
