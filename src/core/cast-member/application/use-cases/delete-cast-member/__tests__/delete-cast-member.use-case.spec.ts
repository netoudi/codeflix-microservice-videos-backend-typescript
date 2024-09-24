import { DeleteCastMemberUseCase } from '@/core/cast-member/application/use-cases/delete-cast-member/delete-cast-member.use-case';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError } from '@/core/shared/domain/value-objects/uuid.vo';

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let useCase: DeleteCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
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
    const items = [CastMember.fake().aCastMember().build()];
    repository.items = items;
    await useCase.execute({ id: items[0].id.value });
    expect(repository.items).toHaveLength(0);
  });
});
