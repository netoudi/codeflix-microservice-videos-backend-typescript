import { CastMember } from '@/core/cast-member/domain/cast-member.entity';
import { CastMemberModel } from '@/core/cast-member/infra/db/sequelize/cast-member.model';
import { EntityValidationError } from '@/core/shared/domain/validators/entity-validation.error';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      id: entity.id.value,
      name: entity.name,
      type: entity.type,
      created_at: entity.created_at,
    });
  }

  static toEntity(model: CastMemberModel): CastMember {
    const castMember = new CastMember({
      id: new Uuid(model.id),
      name: model.name,
      type: model.type,
      created_at: model.created_at,
    });
    castMember.validate();
    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }
    return castMember;
  }

  static toModels(entities: CastMember[]): CastMemberModel[] {
    return entities.map((entity) => this.toModel(entity));
  }

  static toEntities(models: CastMemberModel[]): CastMember[] {
    return models.map((model) => this.toEntity(model));
  }
}
