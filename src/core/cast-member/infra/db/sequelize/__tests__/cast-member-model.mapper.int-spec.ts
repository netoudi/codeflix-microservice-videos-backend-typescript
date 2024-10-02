import { CastMember, CastMemberId } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberModelMapper } from '@/core/cast-member/infra/db/sequelize/cast-member-model.mapper';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import { setupSequelize } from '@/core/shared/infra/testing/helpers';

describe('CastMemberModelMapper Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  it('should throw error when cast member is invalid', async () => {
    expect.assertions(2);
    //@ts-expect-error - This is an invalid cast member
    const model = CastMemberModel.build({
      id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
      name: 'x'.repeat(256),
      type: 3,
    });
    try {
      CastMemberModelMapper.toEntity(model);
      fail('The cast member is valid, but it needs to throws a EntityValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(EntityValidationError);
      expect((error as EntityValidationError).errors).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
        {
          type: ['type must be one of the following values: 1, 2'],
        },
      ]);
    }
  });

  it('should convert a cast member model to a cast member entity', async () => {
    const created_at = new Date();
    const model = CastMemberModel.build({
      id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
      name: 'John Doe',
      type: 1,
      created_at: created_at,
    });
    const entity = CastMemberModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new CastMember({
        id: new CastMemberId('c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c'),
        name: 'John Doe',
        type: 1,
        created_at: created_at,
      }).toJSON(),
    );
  });

  it('should convert a cast member entity to a cast member model', async () => {
    const created_at = new Date();
    const entity = new CastMember({
      id: new CastMemberId('c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c'),
      name: 'John Doe',
      type: 1,
      created_at: created_at,
    });
    const model = CastMemberModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual(
      CastMemberModel.build({
        id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
        name: 'John Doe',
        type: 1,
        created_at: created_at,
      }).toJSON(),
    );
  });

  it('should convert cast members model to cast members entity', async () => {
    const models = [
      CastMemberModel.build({
        id: 'c30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
        name: 'John Doe',
        type: 1,
        created_at: new Date(),
      }),
      CastMemberModel.build({
        id: 'd30c0a92-1c8c-4b9e-9b0c-9b0c9b0c9b0c',
        name: 'Jane Doe',
        type: 2,
        created_at: new Date(),
      }),
    ];
    const entities = CastMemberModelMapper.toEntities(models);
    expect(JSON.stringify(entities)).toStrictEqual(JSON.stringify(models));
  });

  it('should convert cast members entity to cast members model', async () => {
    const entities = CastMember.fake().theCastMembers(3).build();
    const models = CastMemberModelMapper.toModels(entities);
    expect(JSON.stringify(models)).toStrictEqual(JSON.stringify(entities));
  });
});
