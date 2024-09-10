import { GetCastMemberUseCase } from '@/core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError, Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

describe('GetCastMemberUseCase Unit Tests', () => {
  let useCase: GetCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new GetCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id' })).rejects.toThrow(new InvalidUuidError());
    const uuid = new Uuid();
    await expect(useCase.execute({ id: uuid.value })).rejects.toThrow(new NotFoundError(uuid.value, CastMember));
  });

  it('should return a cast member', async () => {
    const items = [CastMember.fake().aCastMember().build()];
    repository.items = items;
    const spyFindById = jest.spyOn(repository, 'findById');
    const output = await useCase.execute({ id: items[0].id.value });
    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].id.value,
      name: items[0].name,
      type: items[0].type,
      created_at: items[0].created_at,
    });
  });
});
