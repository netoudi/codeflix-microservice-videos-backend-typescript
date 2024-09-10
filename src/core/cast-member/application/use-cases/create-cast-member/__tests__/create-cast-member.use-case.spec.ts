import { CreateCastMemberUseCase } from '@/core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';

describe('CreateCastMemberUseCase Unit Tests', () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should throw error when cast member is not valid', async () => {
    await expect(useCase.execute({ name: 'x'.repeat(256), type: CastMemberType.ACTOR })).rejects.toThrow(
      'Entity Validation Error',
    );
  });

  it('should create a new cast member', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    let output = await useCase.execute({ name: 'test', type: CastMemberType.ACTOR });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].id.value,
      name: 'test',
      type: 2,
      created_at: repository.items[0].created_at,
    });
    output = await useCase.execute({ name: 'test', type: CastMemberType.DIRECTOR });
    expect(spyInsert).toHaveBeenCalledTimes(2);
    expect(output).toStrictEqual({
      id: repository.items[1].id.value,
      name: 'test',
      type: 1,
      created_at: repository.items[1].created_at,
    });
  });
});
