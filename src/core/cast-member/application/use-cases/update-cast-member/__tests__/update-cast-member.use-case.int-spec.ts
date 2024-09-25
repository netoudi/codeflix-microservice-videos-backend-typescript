import { UpdateCastMemberUseCase } from '@/core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '@/core/cast-member/infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { NotFoundError } from '@/core/shared/domain/errors/not-found';
import { InvalidUuidError } from '@/core/shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('UpdateCastMemberUseCase Integration Tests', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throw error when entity not found', async () => {
    await expect(useCase.execute({ id: 'fake-id', name: 'test' })).rejects.toThrow(new InvalidUuidError());
    const castMemberId = new CastMemberId();
    await expect(useCase.execute({ id: castMemberId.value, name: 'test' })).rejects.toThrow(
      new NotFoundError(castMemberId.value, CastMember),
    );
  });

  it('should update a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const output = await useCase.execute({ id: castMember.id.value, name: 'test' });
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
          name: null as any,
          type: null as any,
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
      // check if really saved in the database
      const castMemberUpdated = await repository.findById(castMember.id);
      expect(castMemberUpdated).not.toBeNull();
      expect(castMemberUpdated?.id.value).toBe(i.output.id);
      expect(castMemberUpdated?.name).toBe(i.output.name);
      expect(castMemberUpdated?.type).toBe(i.output.type);
      expect(castMemberUpdated?.created_at).toBeDefined();
    }
  });
});
