import { UpdateCastMemberUseCase } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { CastMember, CastMemberId, CastMemberType } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '@/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError } from '@/core/shared/domain/value-objects/uuid.vo';

describe('UpdateCastMemberUseCase Unit Tests', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throw error when cast member is not valid', async () => {
    const castMember = new CastMember({ name: 'John Doe', type: CastMemberType.ACTOR });
    repository.items = [castMember];
    const input = { id: castMember.id.value, name: 'x'.repeat(256) };
    await expect(useCase.execute(input)).rejects.toThrow('Entity Validation Error');
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id', name: 'test' })).rejects.toThrow(new InvalidUuidError());
    const castMemberId = new CastMemberId();
    await expect(useCase.execute({ id: castMemberId.value, name: 'test' })).rejects.toThrow(
      new NotFoundError(castMemberId.value, CastMember),
    );
  });

  it('should update a cast member', async () => {
    const spyInsert = jest.spyOn(repository, 'update');
    const castMember = new CastMember({ name: 'John Doe', type: CastMemberType.ACTOR });
    repository.items = [castMember];
    const output = await useCase.execute({ id: castMember.id.value, name: 'test' });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: castMember.id.value,
      name: 'test',
      type: 2,
      created_at: castMember.created_at,
    });
    type Arrange = {
      input: {
        id: string;
        name?: string;
        type?: number;
      };
      output: {
        id: string;
        name: string;
        type: number;
        created_at: Date;
      };
    };
    const arrange: Arrange[] = [
      {
        input: {
          id: castMember.id.value,
          name: 'test',
          type: 1,
        },
        output: {
          id: castMember.id.value,
          name: 'test',
          type: 1,
          created_at: castMember.created_at,
        },
      },
      {
        input: {
          id: castMember.id.value,
          name: 'test-update',
        },
        output: {
          id: castMember.id.value,
          name: 'test-update',
          type: 1,
          created_at: castMember.created_at,
        },
      },
      {
        input: {
          id: castMember.id.value,
          name: 'test',
          type: 2,
        },
        output: {
          id: castMember.id.value,
          name: 'test',
          type: 2,
          created_at: castMember.created_at,
        },
      },
      {
        input: {
          id: castMember.id.value,
          type: 1,
        },
        output: {
          id: castMember.id.value,
          name: 'test',
          type: 1,
          created_at: castMember.created_at,
        },
      },
      {
        input: {
          id: castMember.id.value,
          name: undefined,
          type: undefined,
        },
        output: {
          id: castMember.id.value,
          name: 'test',
          type: 1,
          created_at: castMember.created_at,
        },
      },
      {
        input: {
          id: castMember.id.value,
          name: null,
          type: null,
        },
        output: {
          id: castMember.id.value,
          name: 'test',
          type: 1,
          created_at: castMember.created_at,
        },
      },
    ];
    for (const i of arrange) {
      const output = await useCase.execute({
        id: i.input.id,
        ...('name' in i.input && { name: i.input.name }),
        ...('type' in i.input && { type: i.input.type }),
      });
      expect(output).toStrictEqual(i.output);
    }
  });
});
